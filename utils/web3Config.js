import { BrowserProvider, Contract } from 'ethers';

const FRIEND_IP = "10.10.119.241";
const FRIEND_PORT = "8545";
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const RPC_URLS = [`http://${FRIEND_IP}:${FRIEND_PORT}`];
const CHAIN_ID = '0x7A69'

const contractABI = [
  {
    "inputs": [],
    "name": "getMessage",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "message",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    console.log('Starting wallet connection...');

    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    try {
      // Add the network
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: CHAIN_ID,
          chainName: 'Local Hardhat Network',
          rpcUrls: RPC_URLS,
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
          }
        }]
      });

      // Switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_ID }],
      });

      // Initialize provider and contract
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, contractABI, signer);

      try {
        // Test contract connection
        const message = await contract.getMessage();
        console.log('Contract message:', message);

        return {
          address: accounts[0],
          message: message,
          contract: contract // Return contract instance if needed
        };

      } catch (contractError) {
        console.error('Contract interaction error:', contractError);
        throw new Error(`Contract interaction failed: ${contractError.message}`);
      }

    } catch (switchError) {
      console.error('Network switch error:', switchError);
      if (switchError.code === 4902) {
        throw new Error('Please add the network to MetaMask first');
      }
      throw switchError;
    }

  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
};

// Optional: Add a function to get contract instance without wallet connection
export const getContractReadOnly = async () => {
  const provider = new BrowserProvider(window.ethereum);
  return new Contract(CONTRACT_ADDRESS, contractABI, provider);
};