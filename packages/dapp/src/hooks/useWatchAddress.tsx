import { UtxoI, Wallet } from "mainnet-js";
import { useEffect, useState } from "react";

export function useWatchAddress(address?: string, tokenId?: string) {
  const [utxos, setUtxos] = useState<UtxoI[] | undefined>(undefined);
  const [tokenUtxos, setTokenUtxos] = useState<UtxoI[] | undefined>(undefined);
  const [balance, setBalance] = useState<number | undefined>(undefined);
  const [tokenBalance, setTokenBalance] = useState<bigint | undefined>(undefined);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    if (!address) {
      return;
    }

    let cancelWatch: () => void;

    (async () => {
      try {
        const wallet = await Wallet.watchOnly(address);

        const callback = async () => {
          try {
            const utxos = await wallet.getUtxos();
            const balance = utxos.reduce((acc, utxo) => acc + (utxo.token ? 0 : utxo.satoshis), 0);
            if (tokenId) {
              const tokenBalance = utxos.reduce((acc, utxo) => acc + (utxo.token?.tokenId === tokenId ? utxo.token!.amount : 0n), 0n);
              setTokenBalance(tokenBalance);
            }

            setTokenUtxos(tokenId ? utxos.filter(utxo => utxo.token?.tokenId === tokenId) : utxos);
            setUtxos(utxos);
            setBalance(balance);
          } catch (error) {
            console.error('Error in UTXO callback:', error);
            setRetries((prev) => prev + 1);
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        };

        cancelWatch = await wallet.provider.subscribeToAddress(address, callback);
      } catch (error) {
        console.error('Error initializing wallet or subscribing to address:', error);
        setRetries((prev) => prev + 1);
        // Don't retry immediately in catch, let the useEffect handle retries
      }
    })();

    return () => {
      cancelWatch?.();
    };
  }, [address, retries, tokenId]);

  return { balance, tokenBalance, utxos, tokenUtxos };
}