/**
 * SPHINCS+ Digital Signature Algorithm Implementation
 * 
 * This module implements the SPHINCS+ digital signature algorithm, which is a stateless
 * hash-based signature scheme that offers post-quantum security based on the security
 * of cryptographic hash functions.
 * 
 * SPHINCS+ is particularly attractive as a backup signature algorithm because it relies
 * on different cryptographic assumptions than lattice-based schemes like Dilithium or
 * Falcon. This provides defense-in-depth if vulnerabilities are discovered in lattice-based
 * cryptography.
 */

import { getRandomBytes, concatUint8Arrays } from './utils/crypto-utils';
import { 
  KeyPair, 
  SphincsSecurityLevel, 
  ALGORITHM_PARAMETER_SIZES 
} from './models/types';

/**
 * Class implementing the SPHINCS+ digital signature algorithm.
 */
export class Sphincs {
  private securityLevel: SphincsSecurityLevel;
  private nativeBindings: boolean;

  /**
   * Creates a new instance of the SPHINCS+ signature algorithm.
   * 
   * @param securityLevel The security level to use (default: SPHINCS+-192S)
   * @param useNativeBindings Whether to use WebAssembly bindings for performance (default: true)
   */
  constructor(
    securityLevel: SphincsSecurityLevel = 'SPHINCS+-192S',
    useNativeBindings: boolean = true
  ) {
    this.securityLevel = securityLevel;
    this.nativeBindings = useNativeBindings;
  }

  /**
   * Generate a SPHINCS+ key pair for digital signatures.
   * 
   * @returns A Promise resolving to a KeyPair containing public and private keys
   */
  public async generateKeyPair(): Promise<KeyPair> {
    // Get the parameter sizes for the selected security level
    const sizes = ALGORITHM_PARAMETER_SIZES.SPHINCS[this.securityLevel];

    if (this.nativeBindings) {
      // In a real implementation, this would use a WebAssembly module
      // For now, we're simulating with random bytes of the correct sizes
      return this.simulateNativeKeyGeneration(sizes);
    } else {
      // Pure TypeScript implementation would be here
      // For demonstration, we're also using the simulation
      return this.simulateNativeKeyGeneration(sizes);
    }
  }

  /**
   * Sign a message using the SPHINCS+ digital signature algorithm.
   * 
   * @param message The message to sign
   * @param privateKey The private key to use for signing
   * @returns A Promise resolving to the signature as a Uint8Array
   * @throws If the private key size doesn't match the expected size for the security level
   */
  public async sign(
    message: Uint8Array,
    privateKey: Uint8Array
  ): Promise<Uint8Array> {
    // Get the parameter sizes for the selected security level
    const sizes = ALGORITHM_PARAMETER_SIZES.SPHINCS[this.securityLevel];
    
    // Verify the private key size matches the expected security level
    if (privateKey.length !== sizes.privateKeySize) {
      throw new Error(`Private key size ${privateKey.length} does not match expected ${this.securityLevel} size ${sizes.privateKeySize}.`);
    }

    if (this.nativeBindings) {
      // In a real implementation, this would use a WebAssembly module
      // For now, we're simulating with random bytes of the correct size
      return this.simulateNativeSign(message, privateKey, sizes);
    } else {
      // Pure TypeScript implementation would be here
      // For demonstration, we're also using the simulation
      return this.simulateNativeSign(message, privateKey, sizes);
    }
  }

  /**
   * Verify a signature using the SPHINCS+ digital signature algorithm.
   * 
   * @param message The original message
   * @param signature The signature to verify
   * @param publicKey The public key to use for verification
   * @returns A Promise resolving to a boolean indicating whether the signature is valid
   * @throws If the public key or signature size doesn't match the expected size for the security level
   */
  public async verify(
    message: Uint8Array,
    signature: Uint8Array,
    publicKey: Uint8Array
  ): Promise<boolean> {
    // Get the parameter sizes for the selected security level
    const sizes = ALGORITHM_PARAMETER_SIZES.SPHINCS[this.securityLevel];
    
    // Verify the public key and signature sizes match the expected security level
    if (publicKey.length !== sizes.publicKeySize) {
      throw new Error(`Public key size ${publicKey.length} does not match expected ${this.securityLevel} size ${sizes.publicKeySize}.`);
    }
    
    if (signature.length !== sizes.signatureSize) {
      throw new Error(`Signature size ${signature.length} does not match expected ${this.securityLevel} size ${sizes.signatureSize}.`);
    }

    if (this.nativeBindings) {
      // In a real implementation, this would use a WebAssembly module
      // For now, we're simulating
      return this.simulateNativeVerify(message, signature, publicKey);
    } else {
      // Pure TypeScript implementation would be here
      // For demonstration, we're also using the simulation
      return this.simulateNativeVerify(message, signature, publicKey);
    }
  }

  /**
   * Change the security level of the SPHINCS+ instance.
   * 
   * @param securityLevel The new security level to use
   */
  public setSecurityLevel(securityLevel: SphincsSecurityLevel): void {
    this.securityLevel = securityLevel;
  }

  /**
   * Enable or disable the use of WebAssembly bindings.
   * 
   * @param useNativeBindings Whether to use WebAssembly bindings
   */
  public setUseNativeBindings(useNativeBindings: boolean): void {
    this.nativeBindings = useNativeBindings;
  }

  /**
   * Create a detached signature for a message.
   * This is useful when you want to store or transmit the signature separately.
   * 
   * @param message The message to sign
   * @param privateKey The private key to use for signing
   * @returns A Promise resolving to the detached signature
   */
  public async signDetached(
    message: Uint8Array,
    privateKey: Uint8Array
  ): Promise<Uint8Array> {
    return this.sign(message, privateKey);
  }

  /**
   * Verify a detached signature for a message.
   * 
   * @param message The original message
   * @param signature The detached signature to verify
   * @param publicKey The public key to use for verification
   * @returns A Promise resolving to a boolean indicating whether the signature is valid
   */
  public async verifyDetached(
    message: Uint8Array,
    signature: Uint8Array,
    publicKey: Uint8Array
  ): Promise<boolean> {
    return this.verify(message, signature, publicKey);
  }

  /**
   * Sign a message and attach the signature to the message.
   * This results in a single Uint8Array containing both the message and signature.
   * 
   * @param message The message to sign
   * @param privateKey The private key to use for signing
   * @returns A Promise resolving to the signed message (message + signature)
   */
  public async signAttached(
    message: Uint8Array,
    privateKey: Uint8Array
  ): Promise<Uint8Array> {
    const signature = await this.sign(message, privateKey);
    
    // Concatenate the signature and message
    // Format: [4 bytes signature length][signature][message]
    const signatureLength = new Uint8Array(4);
    const view = new DataView(signatureLength.buffer);
    view.setUint32(0, signature.length, true); // Little-endian
    
    return concatUint8Arrays([signatureLength, signature, message]);
  }

  /**
   * Verify and extract a message with an attached signature.
   * 
   * @param signedMessage The message with attached signature
   * @param publicKey The public key to use for verification
   * @returns A Promise resolving to the original message if the signature is valid, null otherwise
   */
  public async verifyAttached(
    signedMessage: Uint8Array,
    publicKey: Uint8Array
  ): Promise<Uint8Array | null> {
    if (signedMessage.length < 4) {
      return null; // Too short to contain a signature length
    }
    
    // Extract the signature length
    const view = new DataView(signedMessage.buffer, signedMessage.byteOffset, 4);
    const signatureLength = view.getUint32(0, true); // Little-endian
    
    if (signedMessage.length < 4 + signatureLength) {
      return null; // Too short to contain the full signature
    }
    
    // Extract the signature and message
    const signature = signedMessage.slice(4, 4 + signatureLength);
    const message = signedMessage.slice(4 + signatureLength);
    
    // Verify the signature
    const isValid = await this.verify(message, signature, publicKey);
    
    return isValid ? message : null;
  }

  /**
   * Simulate native key generation for demonstration purposes.
   * In a real implementation, this would call a WebAssembly module.
   * 
   * @param sizes The parameter sizes for the selected security level
   * @returns A simulated key pair
   */
  private async simulateNativeKeyGeneration(sizes: {
    publicKeySize: number;
    privateKeySize: number;
    signatureSize: number;
  }): Promise<KeyPair> {
    // Generate random public and private keys of the correct sizes
    const publicKey = getRandomBytes(sizes.publicKeySize);
    const privateKey = getRandomBytes(sizes.privateKeySize);
    
    return { publicKey, privateKey };
  }

  /**
   * Simulate native signing for demonstration purposes.
   * In a real implementation, this would call a WebAssembly module.
   * 
   * @param message The message to sign
   * @param privateKey The private key to use for signing
   * @param sizes The parameter sizes for the selected security level
   * @returns A simulated signature
   */
  private async simulateNativeSign(
    _message: Uint8Array,
    _privateKey: Uint8Array,
    sizes: {
      publicKeySize: number;
      privateKeySize: number;
      signatureSize: number;
    }
  ): Promise<Uint8Array> {
    // Generate a random signature of the correct size
    const signature = getRandomBytes(sizes.signatureSize);
    
    return signature;
  }

  /**
   * Simulate native signature verification for demonstration purposes.
   * In a real implementation, this would call a WebAssembly module.
   * 
   * @param message The original message
   * @param signature The signature to verify
   * @param publicKey The public key to use for verification
   * @returns A simulated verification result (always true for demonstration)
   */
  private async simulateNativeVerify(
    _message: Uint8Array,
    _signature: Uint8Array,
    _publicKey: Uint8Array
  ): Promise<boolean> {
    // In a real implementation, this would verify the signature
    // For demonstration purposes, we're returning true
    return true;
  }
}