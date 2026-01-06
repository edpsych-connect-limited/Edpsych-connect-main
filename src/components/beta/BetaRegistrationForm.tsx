'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, Checkbox, Paper, Typography, Alert, CircularProgress, Link } from '@mui/material';
const AGREEMENT_PATHS = {
  PRIVACY_POLICY: '/legal/privacy-policy',
  TERMS_OF_SERVICE: '/legal/terms-of-service',
  BETA_TEST_AGREEMENT: '/legal/beta-test-agreement',
  BETA_CONFIDENTIALITY: '/legal/beta-confidentiality'
} as const;

// NOTE: Avoid MUI `sx` in this file.
// In this repo's TS/MUI combination, `sx={{...}}` can trigger TS2590 ("union type too complex").

type AgreementTypes = keyof typeof AGREEMENT_PATHS;

const fetchLegalDocument = async (agreement: AgreementTypes): Promise<string> => {
  return AGREEMENT_PATHS[agreement] || '/legal';
};
const validateBetaAccessCode = async (code: string): Promise<{ valid: boolean; error?: string }> => {
  const validCodes = ['BETA2025', 'TESTACCESS', 'EARLYBIRD'];
  if (validCodes.includes(code.trim().toUpperCase())) {
    return { valid: true };
  }
  return { valid: false, error: 'Invalid access code' };
};
import { LockOutlined, CheckCircleOutline } from '@mui/icons-material';


/**
 * Beta registration form component with confidentiality agreement integration
 * Displays the confidentiality agreement and handles the registration process
 */
const BetaRegistrationForm: React.FC = () => {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');
  const [acceptedAgreement, setAcceptedAgreement] = useState(false);
  const [agreementContent, setAgreementContent] = useState('');
  const [agreementVersion, setAgreementVersion] = useState('');
  const [loading, setLoading] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);
  const [error, setError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeValid, setCodeValid] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch the confidentiality agreement when the component mounts
  useEffect(() => {
    const getAgreement = async () => {
      try {
        const documentPath = await fetchLegalDocument('BETA_CONFIDENTIALITY');
        setAgreementContent(documentPath);
        setAgreementVersion('v1.0');
      } catch (_err) {
        setError('Failed to load confidentiality agreement. Please try again later.');
        console.error('Error fetching agreement:', _err);
      }
    };

    getAgreement();
  }, []);
  
  // Validate access code when it changes
  useEffect(() => {
    // Clear previous validation state
    setCodeError('');
    setCodeValid(false);
    
    // Don't validate empty codes
    if (!accessCode || accessCode.length < 3) {
      return undefined;
    }
    
    // Debounce validation to prevent too many API calls
    const validateCode = async () => {
      try {
        setValidatingCode(true);
        const result = await validateBetaAccessCode(accessCode);
        
        if (result.valid) {
          setCodeValid(true);
        } else {
          setCodeError(result.error || 'Invalid access code');
        }
      } catch (_err) {
        setCodeError('Error validating code');
      } finally {
        setValidatingCode(false);
      }
    };
    
    const timeoutId = setTimeout(validateCode, 500);
    
    return () => clearTimeout(timeoutId);
  }, [accessCode]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode) {
      setError('Please enter your beta access code');
      return;
    }
    
    if (!codeValid) {
      setError('Please enter a valid beta access code');
      return;
    }
    
    if (!acceptedAgreement) {
      setError('You must accept the confidentiality agreement to join the beta program');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/beta/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accessCode,
          acceptedConfidentiality: acceptedAgreement,
          userAgent: navigator.userAgent
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register for beta program');
      }
      
      // Registration successful
      setSuccess(true);
      
      // Redirect to beta dashboard after short delay
      setTimeout(() => {
        router.push('/beta/dashboard');
      }, 2000);
      
    } catch (_err) {
      const message = _err instanceof Error ? _err.message : 'An error occurred during registration';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Display loading state while fetching agreement
  if (!agreementContent && !error) {
    return (
      <div className="flex justify-center my-4">
        <CircularProgress />
      </div>
    );
  }

  // Display success state
  if (success) {
    return (
      <Paper elevation={3} style={{ padding: 32, maxWidth: 800, margin: '32px auto' }}>
        <div style={{ textAlign: 'center', paddingTop: 16, paddingBottom: 16 }}>
          <CheckCircleOutline color="success" style={{ fontSize: 60 }} />
          <Typography variant="h5" component="h2" style={{ marginTop: 16 }}>
            Registration Successful!
          </Typography>
          <Typography style={{ marginTop: 16 }}>
            Thank you for joining the EdPsych Connect World beta program. You will be redirected to the beta dashboard shortly.
          </Typography>
        </div>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} style={{ padding: 32, maxWidth: 800, margin: '32px auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Beta Program Registration
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary">
          Please read and accept the confidentiality agreement to join the beta program
        </Typography>
      </div>

      {error && (
        <Alert severity="error" style={{ marginBottom: 24 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Beta Access Code"
          fullWidth
          margin="normal"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          required
          placeholder="Enter your beta access code"
          variant="outlined"
          error={!!codeError}
          helperText={codeError || (codeValid ? 'Access code valid' : 'Enter your beta access code')}
          disabled={loading}
          InputProps={{
            startAdornment: <LockOutlined style={{ marginRight: 8, color: 'rgba(0,0,0,0.6)' }} />,
            endAdornment: validatingCode ? (
              <CircularProgress size={20} />
            ) : codeValid ? (
              <CheckCircleOutline color="success" />
            ) : null
          }}
        />

        <Paper
          variant="outlined"
          style={{
            marginTop: 24,
            padding: 16,
            maxHeight: 300,
            overflow: 'auto',
            backgroundColor: '#f5f5f5',
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Confidentiality Agreement (v{agreementVersion})
          </Typography>
          
          <div style={{ whiteSpace: 'pre-wrap' }}>
            {agreementContent}
          </div>
        </Paper>

        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center' }}>
          <Checkbox
            checked={acceptedAgreement}
            onChange={(e) => setAcceptedAgreement(e.target.checked)}
            id="accept-agreement"
            color="primary"
            required
          />
          <label htmlFor="accept-agreement">
            <Typography>
              I have read and agree to the Confidentiality Agreement
            </Typography>
          </label>
        </div>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          disabled={loading || !acceptedAgreement || !codeValid || validatingCode}
          style={{ marginTop: 24 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Register for Beta Program'}
        </Button>
      </form>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          By registering, you agree to keep all beta features confidential as outlined in the agreement.
        </Typography>
        <Typography variant="body2" color="text.secondary" style={{ marginTop: 8 }}>
          For questions about the beta program, please contact{' '}
          <Link href="mailto:beta@edpsych-connect.com">beta@edpsych-connect.com</Link>
        </Typography>
      </div>
    </Paper>
  );
};

export default BetaRegistrationForm;
