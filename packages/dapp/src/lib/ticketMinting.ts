import { EventTicketData } from "@/utils";

export interface MintTicketResponse {
  tokenId: string;
  commitment: string;
  txId: string;
  metadataCid?: string;
  metadataUri?: string;
  imageCid?: string;
  cashback?: {
    tokenId?: string;
    txId?: string;
  };
}

export const mintEventTicketNFT = async ({
  ticket,
  cashbackSatoshis,
}: {
  ticket: EventTicketData;
  cashbackSatoshis?: number;
}): Promise<MintTicketResponse> => {
  const response = await fetch("/api/tickets/mint", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ticket, cashbackSatoshis }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.error ?? "Failed to mint ticket NFT";
    throw new Error(message);
  }

  return payload as MintTicketResponse;
};