import { NextRequest, NextResponse } from "next/server";
import { Wallet, TestNetWallet, RegTestWallet } from "mainnet-js";
import {
  DEFAULT_TICKET_IMAGE,
  EventTicketData,
  createEventTicketMetadata,
  createTicketCommitment,
} from "@/utils";
import { uploadFileFromUrl, uploadJson } from "@/lib/pinata";
import { sha256, utf8ToBin } from "@bitauth/libauth";

const DEFAULT_TIP_SATS = 100;
const BCMR_NAMESPACE = "BCMR";

const getNetworkWallet = async () => {
  const seed = process.env.MINTING_WALLET_SEED;
  if (!seed) {
    throw new Error("MINTING_WALLET_SEED is not configured");
  }
  const derivationPath =
    process.env.MINTING_WALLET_DERIVATION_PATH || "m/44'/145'/0'/0/0";

  const network = (process.env.BCH_NETWORK || "mainnet").toLowerCase();

  if (network === "testnet" || network === "chipnet") {
    return await TestNetWallet.fromSeed(seed, derivationPath);
  }

  if (network === "regtest") {
    return await RegTestWallet.fromSeed(seed, derivationPath);
  }

  return await Wallet.fromSeed(seed, derivationPath);
};

const resolveImageReference = async (imageUrl?: string) => {
  const fallback = imageUrl || DEFAULT_TICKET_IMAGE;

  if (fallback.startsWith("ipfs://")) {
    const cid = fallback.replace("ipfs://", "");
    return { imageCid: cid, imageUri: fallback };
  }

  const existingCidMatch = fallback.match(/\/ipfs\/([^/?]+)/);
  if (existingCidMatch?.[1]) {
    const cid = existingCidMatch[1];
    return { imageCid: cid, imageUri: `ipfs://${cid}` };
  }

  const fileName = `${Date.now()}-ticket.png`;
  const upload = await uploadFileFromUrl(fallback, fileName);
  return { imageCid: upload.cid, imageUri: `ipfs://${upload.cid}` };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ticket = body.ticket as EventTicketData;
    const cashbackSatoshis = Number(body.cashbackSatoshis ?? 0);
    const tipSatoshis = Number(body.tipSatoshis ?? DEFAULT_TIP_SATS);

    if (!ticket?.dancerWallet) {
      return NextResponse.json(
        { error: "Dancer wallet address is required" },
        { status: 400 }
      );
    }

    const wallet = await getNetworkWallet();

    const sanitizedTicket: EventTicketData = {
      ...ticket,
      imageUrl: ticket.imageUrl || DEFAULT_TICKET_IMAGE,
    };

    const commitment = createTicketCommitment(sanitizedTicket);

    const { imageCid, imageUri } = await resolveImageReference(
      sanitizedTicket.imageUrl
    );

    const metadata = createEventTicketMetadata({
      ...sanitizedTicket,
      imageUrl: imageUri,
    });

    const metadataUpload = await uploadJson(
      `${commitment}-metadata`,
      metadata
    );

    const genesisResponse = await wallet.tokenGenesis(
      {
        cashaddr: sanitizedTicket.dancerWallet,
        amount: 0n,
        commitment,
        capability: "none",
        value: 1000,
      },
      []
    );

    const tokenId = genesisResponse.tokenIds?.[0];

    if (!tokenId) {
      throw new Error("Failed to create ticket token");
    }

    await publishBcmrRecord({
      wallet,
      tokenId,
      metadataCid: metadataUpload.cid,
    });

    return NextResponse.json({
      tokenId,
      commitment,
      txId: genesisResponse.txId,
      metadataCid: metadataUpload.cid,
      metadataUri: `ipfs://${metadataUpload.cid}`,
      imageCid,
    });
  } catch (error) {
    console.error("Ticket minting failed:", error);
    const message =
      error instanceof Error ? error.message : "Ticket minting failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const publishBcmrRecord = async ({
  wallet,
  tokenId,
  metadataCid,
}: {
  wallet: Wallet;
  tokenId: string;
  metadataCid: string;
}) => {
  const metadataUri = `ipfs://${metadataCid}`;
  const contentHash = sha256.hash(utf8ToBin(metadataUri));

  const payloadParts = [
    Buffer.from(BcmrPrefix(), "hex"),
    Buffer.from(contentHash),
    Buffer.from([1]), // URI count
    serializeUri(metadataUri),
  ];

  const opReturnData = Buffer.concat(payloadParts);

  try {
    await wallet.send([[`OP_RETURN`, opReturnData.toString("hex")]]);
  } catch (error) {
    console.warn("Failed to publish BCMR authchain:", error);
  }
};

const BcmrPrefix = () => {
  const text = BCMR_NAMESPACE;
  const bytes = Buffer.from(text, "utf8");
  return `4${bytes.length.toString(16)}${bytes.toString("hex")}`;
};

const serializeUri = (uri: string) => {
  const data = Buffer.from(uri, "utf8");
  if (data.length < 0xfd) {
    return Buffer.concat([Buffer.from([data.length]), data]);
  }
  if (data.length <= 0xffff) {
    const length = Buffer.alloc(3);
    length[0] = 0xfd;
    length.writeUInt16LE(data.length, 1);
    return Buffer.concat([length, data]);
  }
  const length = Buffer.alloc(5);
  length[0] = 0xfe;
  length.writeUInt32LE(data.length, 1);
  return Buffer.concat([length, data]);
};

