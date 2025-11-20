/**
 * Quantum-Resistant Cryptography Usage Examples
 * 
 * This file demonstrates how to use the quantum-resistant cryptography service
 * in the EdPsych Connect platform. It shows common use cases for key generation,
 * encryption, decryption, signing, and verification.
 */

import { QuantumResistantCrypto, SecurityLevel } from '../quantum-resistant-crypto';

/**
 * Example demonstrating secure data exchange between a researcher and healthcare provider
 * using quantum-resistant cryptography.
 */
async function demoSecureDataExchange() {
  console.log('====== Secure Data Exchange Example ======');
  
  // Initialize the cryptography service
  const crypto = new QuantumResistantCrypto(SecurityLevel.HIGH);
  
  // ===== Step 1: Generate key pairs for both parties =====
  console.log('\n1. Generating key pairs for Research Institution and Healthcare Provider...');
  
  // Generate encryption key pairs for both parties
  const researcherEncKeys = await crypto.generateKyberKeyPair();
  
  // Generate signing key pairs for both parties
  const healthcareSignKeys = await crypto.generateDilithiumKeyPair();
  
  console.log('Key pairs generated successfully.');
  
  // ===== Step 2: Healthcare provider prepares sensitive patient data =====
  console.log('\n2. Healthcare provider preparing sensitive patient data...');
  
  // Sample patient data (in a real scenario, this would be FHIR-formatted)
  const patientData = new TextEncoder().encode(JSON.stringify({
    resourceType: 'Bundle',
    type: 'collection',
    entry: [
      {
        resource: {
          resourceType: 'Patient',
          id: 'example',
          name: [{ family: 'Smith', given: ['John'] }],
          gender: 'male',
          birthDate: '1974-12-25',
          address: [{ use: 'home', text: '123 High Street, London' }]
        }
      },
      {
        resource: {
          resourceType: 'Condition',
          subject: { reference: 'Patient/example' },
          code: {
            coding: [{ system: 'http://snomed.info/sct', code: '35489007', display: 'Depressive disorder' }]
          },
          onsetDateTime: '2023-01-15'
        }
      }
    ]
  }));
  
  // ===== Step 3: Healthcare provider signs the data to prove authenticity =====
  console.log('\n3. Healthcare provider signing the data...');
  
  const signature = crypto.signDilithium(Buffer.from(patientData), healthcareSignKeys.privateKey);
  
  console.log('Data signed with Dilithium signature.');
  
  // ===== Step 4: Healthcare provider encrypts the data for the researcher =====
  console.log('\n4. Healthcare provider encrypting the data for the researcher...');
  
  const encryptedData = crypto.hybridEncrypt(
    Buffer.from(patientData),
    researcherEncKeys.publicKey
  );
  
  console.log('Data encrypted successfully.');
  
  // ===== Step 5: Healthcare provider sends encrypted data and signature to researcher =====
  console.log('\n5. Healthcare provider sending encrypted data and signature to researcher...');
  
  // In a real application, this would be sent over a network
  // For this example, we're just passing the variables
  const transmittedPackage = {
    encryptedData,
    signature,
    healthcarePublicSignKey: healthcareSignKeys.publicKey
  };
  
  console.log('Data package transmitted successfully.');
  
  // ===== Step 6: Researcher decrypts the data =====
  console.log('\n6. Researcher decrypting the received data...');
  
  const decryptedData = crypto.hybridDecrypt(
    transmittedPackage.encryptedData,
    researcherEncKeys.privateKey
  );
  
  console.log('Data decrypted successfully.');
  
  // ===== Step 7: Researcher verifies the signature =====
  console.log('\n7. Researcher verifying the data signature...');
  
  const isSignatureValid = crypto.verifySignature(
    decryptedData,
    transmittedPackage.signature,
    transmittedPackage.healthcarePublicSignKey,
    'DILITHIUM'
  );
  
  if (isSignatureValid) {
    console.log('Signature verified - data is authentic and unmodified.');
    
    // Convert the data back to a readable format
    const decodedData = new TextDecoder().decode(decryptedData);
    console.log('\nDecoded patient data:');
    console.log(decodedData);
  } else {
    console.error('Signature verification failed - data may be tampered or corrupted!');
  }
}

/**
 * Example demonstrating long-term data storage with quantum-resistant security.
 */
async function demoLongTermDataStorage() {
  console.log('\n\n====== Long-Term Data Storage Example ======');
  
  // Initialize the cryptography service
  const crypto = new QuantumResistantCrypto();
  
  // ===== Step 1: Generate key pairs for data encryption and signing =====
  console.log('\n1. Generating key pairs for long-term storage...');
  
  // For long-term storage, we use both Dilithium and SPHINCS+ signatures
  // This provides defense-in-depth if one algorithm is broken
  const kyberKeys = crypto.generateKyberKeyPair();
  const dilithiumKeys = crypto.generateDilithiumKeyPair();
  const sphincsKeys = crypto.generateSphincsKeyPair();
  
  console.log('Key pairs generated successfully.');
  
  // ===== Step 2: Prepare research data for archiving =====
  console.log('\n2. Preparing research data for long-term archiving...');
  
  // Sample research data
  const researchData = new TextEncoder().encode(JSON.stringify({
    study: {
      id: 'EDU-2025-11',
      title: 'Longitudinal Analysis of Learning Patterns in UK Primary Schools',
      investigators: ['Dr. Scott Ighavongbe-Patrick'],
      period: '2023-2025',
      participants: 2500,
      ethicsApproval: 'UKRI-ETH-2023-456'
    },
    findings: {
      summary: 'The study found statistically significant correlations between...',
      keyMetrics: {
        improvementMetric: 0.37,
        confidenceInterval: '0.31-0.42',
        pValue: 0.0023
      }
    },
    conclusions: [
      'Early intervention shows significant improvement in educational outcomes',
      'Personalized learning approaches showed greatest effect in mathematics',
      'Teacher training was a key factor in successful implementation'
    ]
  }));
  
  // ===== Step 3: Sign the data with both signature algorithms =====
  console.log('\n3. Signing the data with multiple quantum-resistant algorithms...');

  void crypto.signDilithium(
    Buffer.from(researchData),
    dilithiumKeys.privateKey
  );

  void crypto.signSphincs(
    Buffer.from(researchData),
    sphincsKeys.privateKey
  );

  console.log('Data signed with both Dilithium and SPHINCS+ signatures.');
  
  // ===== Step 4: Encrypt the data for long-term storage =====
  console.log('\n4. Encrypting the data for long-term storage...');

  void crypto.hybridEncrypt(
    Buffer.from(researchData),
    kyberKeys.publicKey
  );

  console.log('Data encrypted successfully.');
  
  // ===== Step 5: Store the encrypted data and signatures =====
  console.log('\n5. Storing the encrypted data and signatures...');
  
  // In a real application, this would be stored in a secure database
  // For this example, we're just noting that the data is archived
  
  console.log('Data archived successfully with quantum-resistant protection.');
  console.log('This data will remain secure even against future quantum computers.');
  
  // The private keys would be stored in a secure key management system
  // Regular key rotation would also be implemented for active data
}

/**
 * Main function to run all examples.
 */
async function main() {
  try {
    // Example 1: Secure data exchange
    await demoSecureDataExchange();
    
    // Example 2: Long-term data storage
    await demoLongTermDataStorage();
    
    console.log('\n\nAll examples completed successfully.');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// For browser environments, declare TextEncoder/TextDecoder
declare class TextEncoder {
  encode(input?: string): Uint8Array;
}

declare class TextDecoder {
  decode(input?: Uint8Array): string;
}

// Execute the examples
main();