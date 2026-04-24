import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { DATA_SUFFIX } from "../utils/attribution";

function withAttribution(s) {
  const orig = s.sendTransaction.bind(s);
  s.sendTransaction = async (tx) => {
    const rawData = tx.data ?? "0x";
    const suffix  = DATA_SUFFIX.startsWith("0x") ? DATA_SUFFIX.slice(2) : DATA_SUFFIX;
    return orig({ ...tx, data: rawData + suffix });
  };
  return s;
}

const SIGN_MESSAGE = `Welcome to BaseQuest! 👋

By signing this message you confirm:
• You are the owner of this wallet
• You agree to build genuine on-chain history

BaseQuest — live onchain, Build Legacy!

This signature is free and does not trigger any transaction.`;

const SIGNED_KEY = "basequest_signed_";

export function useWallet() {
  const [address,     setAddress]     = useState(null);
  const [signer,      setSigner]      = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSigned,    setIsSigned]    = useState(false);
  const [signing,     setSigning]     = useState(false);
  const [signError,   setSignError]   = useState(null);
  const [chainId,     setChainId]     = useState(null);
  const [connecting,  setConnecting]  = useState(false);

  const BASE_CHAIN_ID = 8453;

  const checkSigned = useCallback((addr) => {
    if (!addr) return false;
    return localStorage.getItem(SIGNED_KEY + addr.toLowerCase()) === "true";
  }, []);

  const switchNetwork = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + BASE_CHAIN_ID.toString(16) }],
      });
    } catch (err) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId:           "0x" + BASE_CHAIN_ID.toString(16),
            chainName:         "Base Mainnet",
            nativeCurrency:    { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls:           ["https://mainnet.base.org"],
            blockExplorerUrls: ["https://basescan.org"],
          }],
        });
      }
    }
  }, []);

  const signWelcome = useCallback(async () => {
    if (!signer || !address) return;
    setSigning(true);
    setSignError(null);
    try {
      await signer.signMessage(SIGN_MESSAGE);
      localStorage.setItem(SIGNED_KEY + address.toLowerCase(), "true");
      setIsSigned(true);
    } catch (err) {
      if (
        err.code === 4001 ||
        err.message?.includes("rejected") ||
        err.message?.includes("denied")
      ) {
        setSignError("You must sign the message to use BaseQuest.");
      } else {
        setSignError(err.message || "Signing failed. Please try again.");
      }
    } finally {
      setSigning(false);
    }
  }, [signer, address]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask or Coinbase Wallet!");
      return;
    }
    setConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const network  = await provider.getNetwork();
      if (Number(network.chainId) !== BASE_CHAIN_ID) {
        await switchNetwork();
      }
      const s    = withAttribution(await provider.getSigner());
      const addr = await s.getAddress();
      setSigner(s);
      setAddress(addr);
      setIsConnected(true);
      setChainId(Number(network.chainId));
      if (checkSigned(addr)) {
        setIsSigned(true);
      }
    } catch (err) {
      console.error("Connect error:", err);
    } finally {
      setConnecting(false);
    }
  }, [switchNetwork, checkSigned]);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setIsConnected(false);
    setIsSigned(false);
    setSignError(null);
    setChainId(null);
  }, []);

  // Auto-reconnect
  useEffect(() => {
    const autoConnect = async () => {
      if (!window.ethereum) return;
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length === 0) return;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const s        = withAttribution(await provider.getSigner());
        const addr     = await s.getAddress();
        const network  = await provider.getNetwork();
        setSigner(s);
        setAddress(addr);
        setIsConnected(true);
        setChainId(Number(network.chainId));
        if (checkSigned(addr)) setIsSigned(true);
      } catch {}
    };
    autoConnect();
  }, [checkSigned]);

  // Account/chain listeners
  useEffect(() => {
    if (!window.ethereum) return;
    const onAccountsChanged = (accounts) => {
      if (accounts.length === 0) disconnectWallet();
      else {
        setAddress(accounts[0]);
        setIsSigned(checkSigned(accounts[0]));
      }
    };
    const onChainChanged = () => window.location.reload();
    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged",    onChainChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener("chainChanged",    onChainChanged);
    };
  }, [disconnectWallet, checkSigned]);

  return {
    address,
    signer,
    isConnected,
    isSigned,
    signing,
    signError,
    chainId,
    connecting,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    signWelcome,
  };
}
