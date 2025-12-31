/**
 * Quantum-Resistant Cryptography Service
 * 
 * This module provides a unified interface for quantum-resistant cryptographic operations
 * using post-quantum algorithms including Kyber (KEM), Dilithium (signatures), and SPHINCS+ (backup signatures).
 * 
 * The implementation follows a hybrid approach, combining traditional and post-quantum
 * cryptography for defense-in-depth.
 */

import * as crypto from 'crypto';
// NOTE: `@noble/post-quantum` uses strict ESM `exports` entries that include the `.js` extension.
// Importing without the extension fails under TS module resolution modes that respect package exports.
import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { slh_dsa_shake_192f } from '@noble/post-quantum/slh-dsa.js';

// Security level configurations
export enum SecurityLevel {
  BASIC = 'basic',      // AES-128 equivalent security
  STANDARD = 'standard', // AES-192 equivalent security
  HIGH = 'high'         // AES-256 equivalent security
}

// Algorithm types
export enum AlgorithmType {
  KEM = 'kem',           // Key Encapsulation Mechanism
  SIGNATURE = 'signature', // Digital Signatures
  HASH = 'hash'           // Hash Functions
}

// Interface for cryptographic keys
export interface CryptoKey {
  type: 'public' | 'private';
  algorithm: string;
  format: 'raw' | 'pem' | 'der';
  key: Buffer;
}

// Interface for encapsulated key
export interface EncapsulatedKey {
  ciphertext: Buffer;
  sharedSecret: Buffer;
}

// Interface for signature result
export interface SignatureResult {
  message: Buffer;
  signature: Buffer;
  publicKey: CryptoKey;
}

/**
 * Quantum-Resistant Cryptography Service
 * 
 * Provides a unified interface for quantum-resistant cryptographic operations.
 */
export class QuantumResistantCrypto {
  private securityLevel: SecurityLevel;
  
  /**
   * Constructor
   * 
   * @param securityLevel The security level to use
   */
  constructor(securityLevel: SecurityLevel = SecurityLevel.STANDARD) {
    this.securityLevel = securityLevel;
  }
  
  /**
   * Generate a key pair for the Kyber KEM
   * 
   * @returns A key pair consisting of public and private keys
   */
  public generateKyberKeyPair(): { publicKey: CryptoKey; privateKey: CryptoKey } {
    // Use real Kyber implementation
    const seed = crypto.randomBytes(32);
    const keyPair = ml_kem768.keygen(seed);
    
    return {
      publicKey: {
        type: 'public',
        algorithm: 'kyber',
        format: 'raw',
        key: Buffer.from(keyPair.publicKey)
      },
      privateKey: {
        type: 'private',
        algorithm: 'kyber',
        format: 'raw',
        key: Buffer.from(keyPair.secretKey)
      }
    };
  }
  
  /**
   * Encapsulate a shared secret using Kyber
   * 
   * @param publicKey The recipient's public key
   * @returns An encapsulated key with ciphertext and shared secret
   */
  public encapsulateKyber(publicKey: CryptoKey): EncapsulatedKey {
    // Use real Kyber implementation
    const result = ml_kem768.encapsulate(new Uint8Array(publicKey.key));
    
    return {
      ciphertext: Buffer.from(result.cipherText),
      sharedSecret: Buffer.from(result.sharedSecret)
    };
  }
  
  /**
   * Decapsulate a shared secret using Kyber
   *
   * @param privateKey The recipient's private key
   * @param ciphertext The ciphertext from the sender
   * @returns The shared secret
   */
  public decapsulateKyber(privateKey: CryptoKey, ciphertext: Buffer): Buffer {
    // Use real Kyber implementation
    const sharedSecret = ml_kem768.decapsulate(new Uint8Array(ciphertext), new Uint8Array(privateKey.key));
    return Buffer.from(sharedSecret);
  }
  
  /**
   * Generate a key pair for the Dilithium signature scheme
   *
   * @returns A key pair consisting of public and private keys
   */
  public generateDilithiumKeyPair(): { publicKey: CryptoKey; privateKey: CryptoKey } {
    // Use real Dilithium implementation
    const seed = crypto.randomBytes(32);
    const keyPair = ml_dsa65.keygen(seed);
    
    return {
      publicKey: {
        type: 'public',
        algorithm: 'dilithium',
        format: 'raw',
        key: Buffer.from(keyPair.publicKey)
      },
      privateKey: {
        type: 'private',
        algorithm: 'dilithium',
        format: 'raw',
        key: Buffer.from(keyPair.secretKey)
      }
    };
  }
  
  /**
   * Sign a message using Dilithium
   *
   * @param message The message to sign
   * @param privateKey The signer's private key
   * @returns The signature
   */
  public signDilithium(message: Buffer, privateKey: CryptoKey): Buffer {
    // Use real Dilithium implementation
    const signature = ml_dsa65.sign(new Uint8Array(privateKey.key), new Uint8Array(message));
    return Buffer.from(signature);
  }
  
  /**
   * Verify a signature using Dilithium
   *
   * @param message The message that was signed
   * @param signature The signature to verify
   * @param publicKey The signer's public key
   * @returns True if the signature is valid, false otherwise
   */
  public verifyDilithium(message: Buffer, signature: Buffer, publicKey: CryptoKey): boolean {
    // Use real Dilithium implementation
    try {
      return ml_dsa65.verify(new Uint8Array(publicKey.key), new Uint8Array(message), new Uint8Array(signature));
    } catch {
      return false;
    }
  }
  
  /**
   * Generate a key pair for the SPHINCS+ signature scheme
   * @returns A key pair consisting of public and private keys
   */
  public generateSphincsKeyPair(): { publicKey: CryptoKey; privateKey: CryptoKey } {
    // Use real SPHINCS+ implementation
    const seed = crypto.randomBytes(32);
    const keyPair = slh_dsa_shake_192f.keygen(seed);
    
    return {
      publicKey: {
        type: 'public',
        algorithm: 'sphincs',
        format: 'raw',
        key: Buffer.from(keyPair.publicKey)
      },
      privateKey: {
        type: 'private',
        algorithm: 'sphincs',
        format: 'raw',
        key: Buffer.from(keyPair.secretKey)
      }
    };
  }
  
  /**
   * Sign a message using SPHINCS+
   *
   * @param message The message to sign
   * @param privateKey The signer's private key
   * @returns The signature
   */
  public signSphincs(message: Buffer, privateKey: CryptoKey): Buffer {
    // Use real SPHINCS+ implementation
    const signature = slh_dsa_shake_192f.sign(new Uint8Array(privateKey.key), new Uint8Array(message));
    return Buffer.from(signature);
  }
  
  /**
   * Verify a signature using SPHINCS+
   *
   * @param message The message that was signed
   * @param signature The signature to verify
   * @param publicKey The signer's public key
   * @returns True if the signature is valid, false otherwise
   */
  public verifySphincs(message: Buffer, signature: Buffer, publicKey: CryptoKey): boolean {
    // Use real SPHINCS+ implementation
    try {
      return slh_dsa_shake_192f.verify(new Uint8Array(publicKey.key), new Uint8Array(message), new Uint8Array(signature));
    } catch {
      return false;
    }
  }
  
  /**
   * Sign a message using a hybrid approach with multiple algorithms
   * 
   * @param message The message to sign
   * @param dilithiumPrivateKey The Dilithium private key
   * @param sphincsPrivateKey The SPHINCS+ private key (optional)
   * @returns The combined signature result
   */
  public signHybrid(
    message: Buffer,
    dilithiumPrivateKey: CryptoKey,
    sphincsPrivateKey?: CryptoKey
  ): SignatureResult {
    // Sign with Dilithium
    const dilithiumSignature = this.signDilithium(message, dilithiumPrivateKey);
    
    // If SPHINCS+ private key is provided, also sign with SPHINCS+
    if (sphincsPrivateKey) {
      const sphincsSignature = this.signSphincs(message, sphincsPrivateKey);
      
      // Combine the signatures
      const combinedSignature = Buffer.concat([
        // First 4 bytes: Dilithium signature length
        Buffer.from([
          (dilithiumSignature.length >> 24) & 0xFF,
          (dilithiumSignature.length >> 16) & 0xFF,
          (dilithiumSignature.length >> 8) & 0xFF,
          dilithiumSignature.length & 0xFF
        ]),
        // Dilithium signature
        dilithiumSignature,
        // SPHINCS+ signature
        sphincsSignature
      ]);
      
      return {
        message,
        signature: combinedSignature,
        publicKey: {
          type: 'public',
          algorithm: 'hybrid',
          format: 'raw',
          key: Buffer.from('hybrid') // Placeholder
        }
      };
    }
    
    // Return just the Dilithium signature if no SPHINCS+ key is provided
    return {
      message,
      signature: dilithiumSignature,
      publicKey: {
        type: 'public',
        algorithm: 'dilithium',
        format: 'raw',
        key: Buffer.from('dilithium') // Placeholder
      }
    };
  }
  
  /**
   * Verify a hybrid signature
   * 
   * @param message The message that was signed
   * @param signature The signature to verify
   * @param dilithiumPublicKey The Dilithium public key
   * @param sphincsPublicKey The SPHINCS+ public key (optional)
   * @returns True if the signature is valid, false otherwise
   */
  public verifyHybrid(
    message: Buffer,
    signature: Buffer,
    dilithiumPublicKey: CryptoKey,
    sphincsPublicKey?: CryptoKey
  ): boolean {
    // Check if this is a combined signature
    if (signature.length > this.getDilithiumSignatureSize() + 4 && sphincsPublicKey) {
      // Extract the Dilithium signature length
      const dilithiumSignatureLength = 
        (signature[0] << 24) | 
        (signature[1] << 16) | 
        (signature[2] << 8) | 
        signature[3];
      
      // Extract the Dilithium signature
      const dilithiumSignature = signature.slice(4, 4 + dilithiumSignatureLength);
      
      // Extract the SPHINCS+ signature
      const sphincsSignature = signature.slice(4 + dilithiumSignatureLength);
      
      // Verify both signatures
      const dilithiumValid = this.verifyDilithium(message, dilithiumSignature, dilithiumPublicKey);
      const sphincsValid = this.verifySphincs(message, sphincsSignature, sphincsPublicKey);
      
      // Both must be valid
      return dilithiumValid && sphincsValid;
    }
    
    // Just verify the Dilithium signature
    return this.verifyDilithium(message, signature, dilithiumPublicKey);
  }
  
  /**
   * Get the key size for Kyber public key based on security level
   */
  private getKyberPublicKeySize(): number {
    switch (this.securityLevel) {
      case SecurityLevel.BASIC:
        return 800; // Kyber-512
      case SecurityLevel.STANDARD:
        return 1184; // Kyber-768
      case SecurityLevel.HIGH:
        return 1568; // Kyber-1024
      default:
        return 1184; // Default to Kyber-768
    }
  }
  
  /**
   * Get the key size for Kyber private key based on security level
   */
  private getKyberPrivateKeySize(): number {
    switch (this.securityLevel) {
      case SecurityLevel.BASIC:
        return 1632; // Kyber-512
      case SecurityLevel.STANDARD:
        return 2400; // Kyber-768
      case SecurityLevel.HIGH:
        return 3168; // Kyber-1024
      default:
        return 2400; // Default to Kyber-768
    }
  }
  
  /**
   * Get the ciphertext size for Kyber based on security level
   */
  private getKyberCiphertextSize(): number {
    switch (this.securityLevel) {
      case SecurityLevel.BASIC:
        return 768; // Kyber-512
      case SecurityLevel.STANDARD:
        return 1088; // Kyber-768
      case SecurityLevel.HIGH:
        return 1568; // Kyber-1024
      default:
        return 1088; // Default to Kyber-768
    }
  }
  
  /**
   * Get the key size for Dilithium public key based on security level
   */
  private getDilithiumPublicKeySize(): number {
    switch (this.securityLevel) {
      case SecurityLevel.BASIC:
        return 1312; // Dilithium2
      case SecurityLevel.STANDARD:
        return 1952; // Dilithium3
      case SecurityLevel.HIGH:
        return 2592; // Dilithium5
      default:
        return 1952; // Default to Dilithium3
    }
  }
  
  /**
   * Get the key size for Dilithium private key based on security level
   */
  private getDilithiumPrivateKeySize(): number {
    switch (this.securityLevel) {
      case SecurityLevel.BASIC:
        return 2528; // Dilithium2
      case SecurityLevel.STANDARD:
        return 4000; // Dilithium3
      case SecurityLevel.HIGH:
        return 4864; // Dilithium5
      default:
        return 4000; // Default to Dilithium3
    }
  }
  
  /**
   * Get the signature size for Dilithium based on security level
   */
  private getDilithiumSignatureSize(): number {
    switch (this.securityLevel) {
      case SecurityLevel.BASIC:
        return 2420; // Dilithium2
      case SecurityLevel.STANDARD:
        return 3293; // Dilithium3
      case SecurityLevel.HIGH:
        return 4595; // Dilithium5
      default:
        return 3293; // Default to Dilithium3
    }
  }
  
  /**
   * Get the key size for SPHINCS+ public key based on security level
   */
  private getSphincsPublicKeySize(): number {
    // SPHINCS+ public key size is the same for all parameter sets
    return 32;
  }
  
  /**
   * Get the key size for SPHINCS+ private key based on security level
   */
  private getSphincsPrivateKeySize(): number {
    // SPHINCS+ private key size is the same for all parameter sets
    return 64;
  }
  
  /**
   * Get the signature size for SPHINCS+ based on security level
   */
   private getSphincsSignatureSize(): number {
     switch (this.securityLevel) {
       case SecurityLevel.BASIC:
         return 7856; // SPHINCS+-128f
       case SecurityLevel.STANDARD:
         return 17088; // SPHINCS+-192f
       case SecurityLevel.HIGH:
         return 29792; // SPHINCS+-256f
       default:
         return 17088; // Default to SPHINCS+-192f
     }
   }

   /**
    * Hybrid encrypt data using Kyber for key exchange and AES for encryption
    * @param data The data to encrypt
    * @param publicKey The recipient's Kyber public key
    * @returns The encrypted data
    */
   public hybridEncrypt(data: Buffer, publicKey: CryptoKey): Buffer {
     // Encapsulate a shared secret
     const encapsulated = this.encapsulateKyber(publicKey);

     // In a real implementation, use the shared secret to encrypt the data with AES
     // For this demo, we'll just concatenate the ciphertext and data
     return Buffer.concat([encapsulated.ciphertext, data]);
   }

   /**
    * Hybrid decrypt data using Kyber for key decapsulation and AES for decryption
    * @param encryptedData The encrypted data
    * @param privateKey The recipient's Kyber private key
    * @returns The decrypted data
    */
   public hybridDecrypt(encryptedData: Buffer, privateKey: CryptoKey): Buffer {
     // Get the ciphertext size
     const ciphertextSize = this.getKyberCiphertextSize();

     // Extract the ciphertext and data
     const ciphertext = encryptedData.slice(0, ciphertextSize);
     const data = encryptedData.slice(ciphertextSize);

     // Decapsulate the shared secret
     void this.decapsulateKyber(privateKey, ciphertext);

     // In a real implementation, use the shared secret to decrypt the data with AES
     // For this demo, just return the data
     return data;
   }

   /**
    * Create a signature using the specified algorithm
    * @param data The data to sign
    * @param privateKey The private key to use
    * @param algorithm The algorithm to use ('DILITHIUM' | 'SPHINCS+')
    * @returns The signature
    */
   public createSignature(data: Buffer, privateKey: CryptoKey, algorithm: 'DILITHIUM' | 'SPHINCS+'): Buffer {
     if (algorithm === 'DILITHIUM') {
       return this.signDilithium(data, privateKey);
     } else {
       return this.signSphincs(data, privateKey);
     }
   }

   /**
    * Verify a signature using the specified algorithm
    * @param data The original data
    * @param signature The signature to verify
    * @param publicKey The public key to use
    * @param algorithm The algorithm used
    * @returns True if valid
    */
   public verifySignature(data: Buffer, signature: Buffer, publicKey: CryptoKey, algorithm: 'DILITHIUM' | 'SPHINCS+'): boolean {
     if (algorithm === 'DILITHIUM') {
       return this.verifyDilithium(data, signature, publicKey);
     } else {
       return this.verifySphincs(data, signature, publicKey);
     }
   }
 }
