/**
 * Cryptographic Utility Functions for Quantum-Resistant Encryption
 * 
 * This module provides common cryptographic utility functions used by the 
 * quantum-resistant encryption modules.
 */

/**
 * Generates cryptographically secure random bytes using the Web Crypto API.
 * 
 * @param length The number of bytes to generate
 * @returns A Uint8Array containing the random bytes
 */
export function getRandomBytes(length: number): Uint8Array {
  const randomBytes = new Uint8Array(length);
  window.crypto.getRandomValues(randomBytes);
  return randomBytes;
}

/**
 * Performs a constant-time comparison of two Uint8Arrays to prevent timing attacks.
 * 
 * Regular equality comparisons may exit early upon finding the first difference,
 * potentially leaking information about the contents through timing side-channels.
 * This function always takes the same amount of time regardless of where differences occur.
 * 
 * @param a The first array to compare
 * @param b The second array to compare
 * @returns True if the arrays are equal, false otherwise
 */
export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    // XOR returns 0 for equal bits, non-zero for different bits
    // Bitwise OR with the running result ensures any difference is preserved
    result |= a[i] ^ b[i];
  }
  
  // Only returns true if result is 0 (all bytes were equal)
  return result === 0;
}

/**
 * Converts a hexadecimal string to a Uint8Array.
 * 
 * @param hex The hexadecimal string to convert
 * @returns A Uint8Array representing the hex string
 */
export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Hex string must have an even number of characters');
  }
  
  const bytes = new Uint8Array(hex.length / 2);
  
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  
  return bytes;
}

/**
 * Converts a Uint8Array to a hexadecimal string.
 * 
 * @param bytes The Uint8Array to convert
 * @returns A hexadecimal string representation of the bytes
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Combines two byte arrays securely using XOR operation.
 * 
 * @param a The first byte array
 * @param b The second byte array
 * @returns The XOR of the two arrays
 */
export function xorBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  if (a.length !== b.length) {
    throw new Error('Byte arrays must have the same length for XOR operation');
  }
  
  const result = new Uint8Array(a.length);
  
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] ^ b[i];
  }
  
  return result;
}

/**
 * Securely erases sensitive data from memory by overwriting it.
 * 
 * Note: JavaScript's garbage collection may keep copies in memory,
 * so this is a best-effort approach.
 * 
 * @param data The data to securely erase
 */
export function secureErase(data: Uint8Array): void {
  // First overwrite with zeros
  for (let i = 0; i < data.length; i++) {
    data[i] = 0;
  }
  
  // Then overwrite with random data
  window.crypto.getRandomValues(data);
  
  // Finally overwrite with zeros again
  for (let i = 0; i < data.length; i++) {
    data[i] = 0;
  }
}

/**
 * Creates a derivation key using HKDF (HMAC-based Key Derivation Function).
 *
 * @param ikm The input keying material
 * @param salt Optional salt (recommended)
 * @param info Optional context and application specific information
 * @param length The length of the output keying material in bytes
 * @returns A promise that resolves to the derived key
 */
export async function deriveKey(
  ikm: Uint8Array,
  salt: Uint8Array = new Uint8Array(0),
  info: Uint8Array = new Uint8Array(0),
  length: number = 32
): Promise<Uint8Array> {
  // Import the IKM as a raw key
  const importedKey = await window.crypto.subtle.importKey(
    'raw',
    ikm.buffer as ArrayBuffer,
    { name: 'HKDF' },
    false,
    ['deriveBits']
  );
  
  // Derive the key using HKDF
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-384',
      salt: salt.buffer as ArrayBuffer,
      info: info.buffer as ArrayBuffer
    },
    importedKey,
    length * 8 // Convert bytes to bits
  );
  
  return new Uint8Array(derivedBits);
}

/**
 * Concatenates multiple Uint8Arrays into a single Uint8Array.
 *
 * @param arrays An array of Uint8Arrays to concatenate
 * @returns A new Uint8Array containing all the input arrays concatenated
 */
export function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  // Calculate the total length of all arrays
  const totalLength = arrays.reduce((length, array) => length + array.length, 0);
  
  // Create a new array with the total length
  const result = new Uint8Array(totalLength);
  
  // Copy each array into the result
  let offset = 0;
  for (const array of arrays) {
    result.set(array, offset);
    offset += array.length;
  }
  
  return result;
}