import { BaseWallet, SendRequest } from "mainnet-js";
import { EventTicketData, createTicketCommitment } from "../utils";

/**
 * Creates a CashToken (NFT) for an event ticket using mainnet-js
 */
export const createEventTicketToken = async (
  wallet: BaseWallet,
  ticketData: EventTicketData,
  cashbackAddress?: string
): Promise<{
  tokenId: string;
  commitment: string;
  txId: string;
}> => {
  try {
    // Create a unique commitment for this ticket
    const commitment = createTicketCommitment(ticketData);

    // Manually build and send a token genesis transaction
    // This is required because WrapWallet does not support `tokenGenesis` directly
    const genesisResponse = await wallet.send({
      cashaddr: wallet.cashaddr!,
      value: 1000, // Dust amount for the token
      unit: "sat",
      token: {
        amount: 0n, // NFT
        capability: "none",
        commitment: commitment,
      },
    });

    const tokenId = genesisResponse.tokenIds![0];
    
    if (!tokenId) {
      throw new Error("Failed to create token - no token ID returned");
    }

    return {
      tokenId,
      commitment,
      txId: genesisResponse.txId,
    };
  } catch (error) {
    console.error("Error creating event ticket token:", error);
    throw error;
  }
};

/**
 * Sends a CashToken (NFT) to a specific address
 */
export const sendEventTicketToken = async (
  wallet: BaseWallet,
  tokenId: string,
  commitment: string,
  recipientAddress: string
): Promise<string> => {
  try {
    const sendResponse = await wallet.send([
      {
        cashaddr: recipientAddress,
        token: {
          tokenId: tokenId,
          commitment: commitment,
          capability: "none",
        },
        value: 1000, // Minimum value for token UTXO
      }
    ]);

    return sendResponse.txId;
  } catch (error) {
    console.error("Error sending event ticket token:", error);
    throw error;
  }
};

/**
 * Gets the token UTXOs for a wallet related to event tickets
 */
export const getEventTicketTokens = async (
  wallet: BaseWallet,
  eventId?: string
) => {
  try {
    const utxos = await wallet.getTokenUtxos();

    // Filter for event ticket tokens (this is a simplified check - in a real app you'd have better filtering)
    const ticketTokens = utxos.filter(utxo => {
      // This is a basic filter - in reality, you'd check the commitment or token metadata
      return !!utxo.token?.tokenId && utxo.token?.amount === 0n; // NFT tokens have amount 0
    });

    return ticketTokens;
  } catch (error) {
    console.error("Error getting event ticket tokens:", error);
    throw error;
  }
};

/**
 * Creates CashBack CashToken for dancers (future reward)
 */
export const createCashBackToken = async (
  wallet: BaseWallet,
  amount: number, // amount in satoshis
  recipientAddress: string,
  eventId: string
): Promise<{
  tokenId: string;
  txId: string;
}> => {
  try {
    // Create a cashback token with specific amount
    const genesisResponse = await wallet.tokenGenesis({
      cashaddr: recipientAddress,
      amount: BigInt(amount),
      commitment: `cashback:${eventId}`,
      capability: "mutable",           // Cashback tokens could be mutable for future updates
      value: 1000,
    });

    const tokenId = genesisResponse.tokenIds![0];

    if (!tokenId) {
      throw new Error("Failed to create cashback token - no token ID returned");
    }

    return {
      tokenId,
      txId: genesisResponse.txId
    };
  } catch (error) {
    console.error("Error creating cashback token:", error);
    throw error;
  }
};