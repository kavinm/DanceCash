import { NextRequest } from "next/server";
import { Wallet, TestNetWallet, RegTestWallet } from "mainnet-js";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const network = (process.env.BCH_NETWORK || "mainnet").toLowerCase();

    if (!address) {
      return Response.json({ error: "address query param is required" }, { status: 400 });
    }

    let wallet;
    if (network === "testnet" || network === "chipnet") {
      wallet = await TestNetWallet.watchOnly(address);
    } else if (network === "regtest") {
      wallet = await RegTestWallet.watchOnly(address);
    } else {
      wallet = await Wallet.watchOnly(address);
    }

    const utxos = await wallet.getTokenUtxos();
    const tokens = utxos
      .filter((utxo) => utxo.token?.tokenId)
      .map((utxo) => ({
        tokenId: utxo.token!.tokenId,
        commitment: utxo.token?.commitment,
        capability: utxo.token?.capability,
      }));

    return Response.json({
      address,
      tokens,
    });
  } catch (error) {
    console.error("Error fetching wallet tokens:", error);
    return Response.json({ error: "Failed to fetch wallet tokens" }, { status: 500 });
  }
}

