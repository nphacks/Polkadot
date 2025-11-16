import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

export const WalletConnection: React.FC = () => {
  const {
    account,
    accounts,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    selectAccount,
  } = useWallet();

  const [showAccountSelector, setShowAccountSelector] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (err) {
      // Error is already handled in context
      console.error('Wallet connection error:', err);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowAccountSelector(false);
  };

  const handleAccountSelect = (address: string) => {
    selectAccount(address);
    setShowAccountSelector(false);
  };

  const formatAddress = (address: string): string => {
    if (address.length <= 13) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && account) {
    return (
      <div className="relative">
        <div className="flex items-center gap-3">
          {/* Account Display */}
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex flex-col">
              {account.meta.name && (
                <span className="text-sm font-medium text-gray-900">
                  {account.meta.name}
                </span>
              )}
              <span className="text-xs text-gray-600 font-mono">
                {formatAddress(account.address)}
              </span>
            </div>
          </div>

          {/* Account Selector Button */}
          {accounts.length > 1 && (
            <button
              onClick={() => setShowAccountSelector(!showAccountSelector)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Switch account"
            >
              Switch
            </button>
          )}

          {/* Disconnect Button */}
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Disconnect
          </button>
        </div>

        {/* Account Authorization Info Message */}
        {accounts.length === 1 && (
          <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg max-w-md">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-primary-800 dark:text-primary-200">
                <p className="font-medium mb-1">Want to use multiple accounts?</p>
                <p className="mb-2">
                  Open your Polkadot.js extension and authorize additional accounts
                  for this site to enable account switching.
                </p>
                <p className="text-xs text-primary-700 dark:text-primary-300">
                  Click the extension icon in your browser, then go to the settings (gear icon)
                  and manage which accounts are authorized for HistoryDAO.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Account Selector Dropdown */}
        {showAccountSelector && accounts.length > 1 && (
          <div className="absolute top-full mt-2 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Select Account</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {accounts.map((acc) => (
                <button
                  key={acc.address}
                  onClick={() => handleAccountSelect(acc.address)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    acc.address === account.address ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {acc.address === account.address && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    )}
                    <div className="flex-1">
                      {acc.meta.name && (
                        <div className="text-sm font-medium text-gray-900">
                          {acc.meta.name}
                        </div>
                      )}
                      <div className="text-xs text-gray-600 font-mono">
                        {acc.address}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
          isConnecting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-primary-600 hover:bg-primary-700'
        }`}
      >
        {isConnecting ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Connecting...
          </span>
        ) : (
          'Connect Wallet'
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="max-w-md bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900 mb-1">
                Connection Error
              </h4>
              <p className="text-sm text-red-700">{error}</p>
              {error.includes('extension') && (
                <a
                  href="https://polkadot.js.org/extension/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm font-medium text-red-600 hover:text-red-800 underline"
                >
                  Install Polkadot.js Extension
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
