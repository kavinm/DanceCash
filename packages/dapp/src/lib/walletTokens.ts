import { Wallet } from "mainnet-js";

export interface WalletToken {
  tokenId: string;
  commitment?: string;
  capability?: string;
}

export const fetchWalletTokens = async (address: string, network: string) => {
  const wallet =
    network === "testnet"
      ? await Wallet.watchOnly(address, "testnet")
      : await Wallet.watchOnly(address);

  const utxos = await wallet.getTokenUtxos();

  return utxos
    .filter((utxo) => utxo.token?.tokenId)
    .map<WalletToken>((utxo) => ({
      tokenId: utxo.token!.tokenId,
      commitment: utxo.token?.commitment,
      capability: utxo.token?.capability,
    }));
};

