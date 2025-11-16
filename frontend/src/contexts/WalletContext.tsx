import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { WalletAccount } from '../types';

interface WalletContextType {
  account: WalletAccount | null;
  accounts: WalletAccount[];
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  selectAccount: (address: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'historydao-wallet';

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load persisted connection state on mount
  useEffect(() => {
    const loadPersistedConnection = async () => {
      const savedAddress = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (savedAddress) {
        try {
          // Try to reconnect with saved address
          await connectWallet(savedAddress);
        } catch (err) {
          // If reconnection fails, clear the saved state
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    };

    loadPersistedConnection();
  }, []);

  const convertToWalletAccount = (injectedAccount: InjectedAccountWithMeta): WalletAccount => {
    return {
      address: injectedAccount.address,
      meta: {
        name: injectedAccount.meta.name,
        source: injectedAccount.meta.source,
        genesisHash: injectedAccount.meta.genesisHash || undefined,
      },
      type: injectedAccount.type,
    };
  };

  const connectWallet = async (preferredAddress?: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      // Enable the extension
      const extensions = await web3Enable('HistoryDAO');

      if (extensions.length === 0) {
        throw new Error(
          'No Polkadot.js extension found. Please install the Polkadot.js extension from your browser\'s extension store.'
        );
      }

      // Get all accounts
      const injectedAccounts = await web3Accounts();

      if (injectedAccounts.length === 0) {
        throw new Error(
          'No accounts found. Please create an account in your Polkadot.js extension.'
        );
      }

      // Convert to WalletAccount format
      const walletAccounts = injectedAccounts.map(convertToWalletAccount);
      setAccounts(walletAccounts);

      // Select account (preferred or first available)
      let selectedAccount: WalletAccount;
      if (preferredAddress) {
        const found = walletAccounts.find(acc => acc.address === preferredAddress);
        selectedAccount = found || walletAccounts[0];
      } else {
        selectedAccount = walletAccounts[0];
      }

      setAccount(selectedAccount);
      setIsConnected(true);

      // Persist connection
      sessionStorage.setItem(SESSION_STORAGE_KEY, selectedAccount.address);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      setIsConnected(false);
      setAccount(null);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setAccounts([]);
    setIsConnected(false);
    setError(null);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const selectAccount = (address: string) => {
    const selectedAccount = accounts.find(acc => acc.address === address);
    if (selectedAccount) {
      setAccount(selectedAccount);
      sessionStorage.setItem(SESSION_STORAGE_KEY, selectedAccount.address);
    }
  };

  const value: WalletContextType = {
    account,
    accounts,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    selectAccount,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
