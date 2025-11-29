/**
 * Type definitions for quantum-resistant cryptography implementation
 */

// Base types for quantum-resistant keys
export interface QuantumKeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

// Generic KeyPair interface for use across implementations
export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

// Security level types for different algorithms
export type DilithiumSecurityLevel = 'DILITHIUM2' | 'DILITHIUM3' | 'DILITHIUM5';
export type KyberSecurityLevel = 'KYBER512' | 'KYBER768' | 'KYBER1024';
export type SphincsSecurityLevel = 'SPHINCS+-128S' | 'SPHINCS+-192S' | 'SPHINCS+-256S';
export type FalconSecurityLevel = 'FALCON-512' | 'FALCON-1024';

// Algorithm-specific key types
export interface KyberKeyPair extends QuantumKeyPair {
  algorithm: 'KYBER';
  parameterSet: 'KYBER512' | 'KYBER768' | 'KYBER1024';
}

export interface DilithiumKeyPair extends QuantumKeyPair {
  algorithm: 'DILITHIUM';
  parameterSet: 'DILITHIUM2' | 'DILITHIUM3' | 'DILITHIUM5';
}

export interface SphincsPlusKeyPair extends QuantumKeyPair {
  algorithm: 'SPHINCS+';
  parameterSet: 'SPHINCS+-128S' | 'SPHINCS+-192S' | 'SPHINCS+-256S';
}

export interface FalconKeyPair extends QuantumKeyPair {
  algorithm: 'FALCON';
  parameterSet: 'FALCON-512' | 'FALCON-1024';
}

// Encapsulated key with ciphertext
export interface EncapsulatedKey {
  sharedSecret: Uint8Array;
  ciphertext: Uint8Array;
}

// Digital signature type
export interface DigitalSignature {
  signature: Uint8Array;
  algorithm: 'DILITHIUM' | 'SPHINCS+' | 'FALCON';
  parameterSet: string;
}

// Hybrid encryption result combining traditional and quantum-resistant methods
export interface HybridEncryptionResult {
  ciphertext: Uint8Array;
  encapsulatedKey: EncapsulatedKey;
  iv: Uint8Array;
  authTag?: Uint8Array;
  ephemeralPublicKey?: Uint8Array; // For traditional ECDH
}

// Configuration for the quantum-resistant cryptography module
export interface QuantumResistantConfig {
  defaultKyberLevel: 'KYBER512' | 'KYBER768' | 'KYBER1024';
  defaultDilithiumLevel: 'DILITHIUM2' | 'DILITHIUM3' | 'DILITHIUM5';
  defaultSphincsLevel: 'SPHINCS+-128S' | 'SPHINCS+-192S' | 'SPHINCS+-256S';
  defaultFalconLevel: 'FALCON-512' | 'FALCON-1024';
  useHybridMode: boolean;
  traditionalAlgorithm: 'RSA' | 'ECDH' | 'ECDSA';
  enableSideChannelProtection: boolean;
}

// Constants for algorithm parameters
export const SECURITY_LEVELS = {
  // NIST security levels
  LEVEL1: 'LEVEL1', // Equivalent to AES-128
  LEVEL3: 'LEVEL3', // Equivalent to AES-192
  LEVEL5: 'LEVEL5', // Equivalent to AES-256
};

export const ALGORITHM_PARAMETER_SIZES = {
  KYBER: {
    KYBER512: {
      publicKeySize: 800,
      privateKeySize: 1632,
      ciphertextSize: 768,
      securityLevel: SECURITY_LEVELS.LEVEL1,
    },
    KYBER768: {
      publicKeySize: 1184,
      privateKeySize: 2400,
      ciphertextSize: 1088,
      securityLevel: SECURITY_LEVELS.LEVEL3,
    },
    KYBER1024: {
      publicKeySize: 1568,
      privateKeySize: 3168,
      ciphertextSize: 1568,
      securityLevel: SECURITY_LEVELS.LEVEL5,
    },
  },
  DILITHIUM: {
    DILITHIUM2: {
      publicKeySize: 1312,
      privateKeySize: 2528,
      signatureSize: 2420,
      securityLevel: SECURITY_LEVELS.LEVEL1,
    },
    DILITHIUM3: {
      publicKeySize: 1952,
      privateKeySize: 4000,
      signatureSize: 3293,
      securityLevel: SECURITY_LEVELS.LEVEL3,
    },
    DILITHIUM5: {
      publicKeySize: 2592,
      privateKeySize: 4864,
      signatureSize: 4595,
      securityLevel: SECURITY_LEVELS.LEVEL5,
    },
  },
  SPHINCS: {
    'SPHINCS+-128S': {
      publicKeySize: 32,
      privateKeySize: 64,
      signatureSize: 7856,
      securityLevel: SECURITY_LEVELS.LEVEL1,
    },
    'SPHINCS+-192S': {
      publicKeySize: 48,
      privateKeySize: 96,
      signatureSize: 16224,
      securityLevel: SECURITY_LEVELS.LEVEL3,
    },
    'SPHINCS+-256S': {
      publicKeySize: 64,
      privateKeySize: 128,
      signatureSize: 29792,
      securityLevel: SECURITY_LEVELS.LEVEL5,
    },
  },
  FALCON: {
    'FALCON-512': {
      publicKeySize: 897,
      privateKeySize: 1281,
      signatureSize: 666,
      securityLevel: SECURITY_LEVELS.LEVEL1,
    },
    'FALCON-1024': {
      publicKeySize: 1793,
      privateKeySize: 2305,
      signatureSize: 1280,
      securityLevel: SECURITY_LEVELS.LEVEL5,
    },
  },
};

// Default configuration
export const DEFAULT_CONFIG: QuantumResistantConfig = {
  defaultKyberLevel: 'KYBER768', // NIST security level 3
  defaultDilithiumLevel: 'DILITHIUM3', // NIST security level 3
  defaultSphincsLevel: 'SPHINCS+-192S', // NIST security level 3
  defaultFalconLevel: 'FALCON-512', // NIST security level 1
  useHybridMode: true, // Combine with traditional algorithms
  traditionalAlgorithm: 'ECDH',
  enableSideChannelProtection: true,
};