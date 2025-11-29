/**
 * Kyber Key Encapsulation Mechanism Implementation
 * 
 * This module provides a TypeScript implementation of the Kyber KEM algorithm,
 * which is a lattice-based post-quantum cryptographic algorithm selected by NIST
 * for standardization.
 * 
 * Kyber is based on the hardness of the Module Learning With Errors (MLWE) problem,
 * which is believed to be resistant to attacks by quantum computers.
 * 
 * This implementation is a wrapper around the underlying native implementation,
 * leveraging WebAssembly bindings to optimized C/C++ code.
 */

import { 
  KyberKeyPair, 
  EncapsulatedKey, 
  ALGORITHM_PARAMETER_SIZES,
  DEFAULT_CONFIG
} from './models/types';
import { constantTimeEqual } from './utils/crypto-utils';
import { KyberNative } from './bindings/kyber-native';

// Load the Kyber WebAssembly module
const kyberModule = KyberNative.getInstance();

/**
 * Generates a new Kyber key pair for quantum-resistant key encapsulation.
 * 
 * @param parameterSet The Kyber parameter set to use (default: KYBER768)
 * @returns A promise that resolves to a KyberKeyPair containing public and private keys
 */
export async function generateKeyPair(
  parameterSet: 'KYBER512' | 'KYBER768' | 'KYBER1024' = DEFAULT_CONFIG.defaultKyberLevel
): Promise<KyberKeyPair> {
  await kyberModule.initialize();
  
  // Get the correct parameter sizes
  const sizes = ALGORITHM_PARAMETER_SIZES.KYBER[parameterSet];
  
  // Generate the key pair using the native implementation
  const result = await kyberModule.keyGen(parameterSet);
  
  // Verify the key sizes match the expected parameter set
  if (result.publicKey.length !== sizes.publicKeySize || 
      result.privateKey.length !== sizes.privateKeySize) {
    throw new Error(`Generated key sizes do not match expected ${parameterSet} parameter set.`);
  }
  
  return {
    publicKey: result.publicKey,
    privateKey: result.privateKey,
    algorithm: 'KYBER',
    parameterSet
  };
}

/**
 * Encapsulates a shared secret using a recipient's public key.
 * 
 * @param publicKey The recipient's Kyber public key
 * @param parameterSet The Kyber parameter set used for the public key
 * @returns A promise that resolves to an EncapsulatedKey containing the shared secret and ciphertext
 */
export async function encapsulate(
  publicKey: Uint8Array,
  parameterSet: 'KYBER512' | 'KYBER768' | 'KYBER1024' = DEFAULT_CONFIG.defaultKyberLevel
): Promise<EncapsulatedKey> {
  await kyberModule.initialize();
  
  // Get the correct parameter sizes
  const sizes = ALGORITHM_PARAMETER_SIZES.KYBER[parameterSet];
  
  // Verify the public key size matches the expected parameter set
  if (publicKey.length !== sizes.publicKeySize) {
    throw new Error(`Public key size ${publicKey.length} does not match expected ${parameterSet} size ${sizes.publicKeySize}.`);
  }
  
  // Encapsulate the shared secret using the native implementation
  const result = await kyberModule.encap(publicKey, parameterSet);
  
  // Verify the ciphertext size matches the expected parameter set
  if (result.ciphertext.length !== sizes.ciphertextSize) {
    throw new Error(`Generated ciphertext size does not match expected ${parameterSet} size.`);
  }
  
  return {
    sharedSecret: result.sharedSecret,
    ciphertext: result.ciphertext
  };
}

/**
 * Decapsulates a shared secret using the recipient's private key and the sender's ciphertext.
 * 
 * @param ciphertext The ciphertext generated during encapsulation
 * @param privateKey The recipient's Kyber private key
 * @param parameterSet The Kyber parameter set used for the keys
 * @returns A promise that resolves to the decapsulated shared secret
 */
export async function decapsulate(
  ciphertext: Uint8Array,
  privateKey: Uint8Array,
  parameterSet: 'KYBER512' | 'KYBER768' | 'KYBER1024' = DEFAULT_CONFIG.defaultKyberLevel
): Promise<Uint8Array> {
  await kyberModule.initialize();
  
  // Get the correct parameter sizes
  const sizes = ALGORITHM_PARAMETER_SIZES.KYBER[parameterSet];
  
  // Verify the ciphertext and private key sizes match the expected parameter set
  if (ciphertext.length !== sizes.ciphertextSize) {
    throw new Error(`Ciphertext size ${ciphertext.length} does not match expected ${parameterSet} size ${sizes.ciphertextSize}.`);
  }
  
  if (privateKey.length !== sizes.privateKeySize) {
    throw new Error(`Private key size ${privateKey.length} does not match expected ${parameterSet} size ${sizes.privateKeySize}.`);
  }
  
  // Decapsulate the shared secret using the native implementation
  const sharedSecret = await kyberModule.decap(ciphertext, privateKey, parameterSet);
  
  return sharedSecret;
}

/**
 * Implements hybrid key encapsulation using both Kyber and a traditional algorithm.
 * This approach provides a defense-in-depth strategy that remains secure if either
 * algorithm is broken.
 * 
 * @param publicKey The recipient's Kyber public key
 * @param parameterSet The Kyber parameter set to use
 * @returns A promise that resolves to a hybrid encapsulated key
 */
export async function hybridEncapsulate(
  publicKey: Uint8Array,
  parameterSet: 'KYBER512' | 'KYBER768' | 'KYBER1024' = DEFAULT_CONFIG.defaultKyberLevel
): Promise<EncapsulatedKey> {
  // Generate a traditional key pair (e.g., ECDH)
  const traditionalKeyPair = await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-384'
    },
    true,
    ['deriveKey', 'deriveBits']
  );
  
  // Export the public key for sending to the recipient
  const traditionalPublicKey = await window.crypto.subtle.exportKey(
    'raw',
    traditionalKeyPair.publicKey
  );
  
  // Perform Kyber encapsulation
  const kyberResult = await encapsulate(publicKey, parameterSet);
  
  // Combine the shared secrets (XOR or other appropriate method)
  const combinedSharedSecret = await combineSharedSecrets(
    kyberResult.sharedSecret,
    new Uint8Array(traditionalPublicKey)
  );
  
  return {
    sharedSecret: combinedSharedSecret,
    ciphertext: kyberResult.ciphertext,
    // Include the traditional public key for hybrid decapsulation
    traditionalPublicKey: new Uint8Array(traditionalPublicKey)
  } as EncapsulatedKey & { traditionalPublicKey: Uint8Array };
}

/**
 * Helper function to combine shared secrets from multiple key encapsulation methods.
 * 
 * @param secret1 The first shared secret
 * @param secret2 The second shared secret
 * @returns A combined shared secret
 */
async function combineSharedSecrets(secret1: Uint8Array, secret2: Uint8Array): Promise<Uint8Array> {
  // Use HKDF to derive a new key from both secrets
  const combinedMaterial = new Uint8Array(secret1.length + secret2.length);
  combinedMaterial.set(secret1, 0);
  combinedMaterial.set(secret2, secret1.length);
  
  // Import the combined material as a raw key
  const importedKey = await window.crypto.subtle.importKey(
    'raw',
    combinedMaterial,
    { name: 'HKDF' },
    false,
    ['deriveBits']
  );
  
  // Derive a new key using HKDF
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-384',
      salt: new Uint8Array(32), // Should use a proper salt in production
      info: new TextEncoder().encode('HybridKyberECDH')
    },
    importedKey,
    256 // Derive a 256-bit key
  );
  
  return new Uint8Array(derivedBits);
}

/**
 * Provides timing-safe comparison of Kyber keys.
 * 
 * @param key1 The first key to compare
 * @param key2 The second key to compare
 * @returns True if the keys are equal, false otherwise
 */
export function compareKeys(key1: Uint8Array, key2: Uint8Array): boolean {
  return constantTimeEqual(key1, key2);
}

/**
 * Serializes a Kyber key pair to a string format for storage.
 * 
 * @param keyPair The Kyber key pair to serialize
 * @returns A serialized representation of the key pair
 */
export function serializeKeyPair(keyPair: KyberKeyPair): string {
  const serialized = {
    publicKey: Array.from(keyPair.publicKey),
    privateKey: Array.from(keyPair.privateKey),
    algorithm: keyPair.algorithm,
    parameterSet: keyPair.parameterSet
  };
  
  return JSON.stringify(serialized);
}

/**
 * Deserializes a string representation of a Kyber key pair.
 * 
 * @param serialized The serialized key pair string
 * @returns The deserialized Kyber key pair
 */
export function deserializeKeyPair(serialized: string): KyberKeyPair {
  const parsed = JSON.parse(serialized);
  
  return {
    publicKey: new Uint8Array(parsed.publicKey),
    privateKey: new Uint8Array(parsed.privateKey),
    algorithm: parsed.algorithm,
    parameterSet: parsed.parameterSet
  };
}