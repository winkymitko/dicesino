import crypto from 'crypto';
import * as bip39 from 'bip39';
import hdkey from 'hdkey';
import { Wallet } from 'ethereumjs-wallet';

const CRYPTO_SECRET = process.env.CRYPTO_SECRET || 'fallback-crypto-secret';

export interface WalletData {
  address: string;
  privateKey: string;
}

export const generateWallet = (): WalletData => {
  // Generate a random mnemonic
  const mnemonic = bip39.generateMnemonic();
  
  // Create seed from mnemonic
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  
  // Create HD wallet
  const root = hdkey.fromMasterSeed(seed);
  
  // Derive first account (m/44'/60'/0'/0/0)
  const addrNode = root.derive("m/44'/60'/0'/0/0");
  
  // Create wallet from private key
  const wallet = Wallet.fromPrivateKey(addrNode.privateKey);
  
  return {
    address: `0x${wallet.getAddress().toString('hex')}`,
    privateKey: `0x${wallet.getPrivateKey().toString('hex')}`,
  };
};

export const encryptPrivateKey = (privateKey: string): string => {
  const cipher = crypto.createCipher('aes-256-cbc', CRYPTO_SECRET);
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

export const decryptPrivateKey = (encryptedPrivateKey: string): string => {
  const decipher = crypto.createDecipher('aes-256-cbc', CRYPTO_SECRET);
  let decrypted = decipher.update(encryptedPrivateKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};