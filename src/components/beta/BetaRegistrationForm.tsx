/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button, TextField, Checkbox, Paper, Typography, Box, Alert, CircularProgress, Link } from '@mui/material';
const AGREEMENT_PATHS = {
  PRIVACY_POLICY: '/legal/privacy-policy',
  TERMS_OF_SERVICE: '/legal/terms-of-service',
  BETA_TEST_AGREEMENT: '/legal/beta-test-agreement',
  BETA_CONFIDENTIALITY: '/legal/beta-confidentiality'
} as const;

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
        console.error('Error fetching agreement:', err);
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
      const message = err instanceof Error ? err.message : 'An error occurred during registration';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Display loading state while fetching agreement
  if (!agreementContent && !error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Display success state
  if (success) {
    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', my: 4 }}>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <CheckCircleOutline color="success" sx={{ fontSize: 60 }} />
          <Typography variant="h5" component="h2" sx={{ mt: 2 }}>
            Registration Successful!
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Thank you for joining the EdPsych Connect World beta program. You will be redirected to the beta dashboard shortly.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', my: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Beta Program Registration
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary">
          Please read and accept the confidentiality agreement to join the beta program
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
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
            startAdornment: <LockOutlined sx={{ mr: 1, color: 'text.secondary' }} />,
            endAdornment: validatingCode ? (
              <CircularProgress size={20} />
            ) : codeValid ? (
              <CheckCircleOutline color="success" />
            ) : null
          }}
        />

        <Paper
          variant="outlined"
          sx={{ 
            mt: 3, 
            p: 2, 
            maxHeight: 300, 
            overflow: 'auto',
            bgcolor: 'background.default'
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Confidentiality Agreement (v{agreementVersion})
          </Typography>
          
          <Box sx={{ whiteSpace: 'pre-wrap' }}>
            {agreementContent}
          </Box>
        </Paper>

        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
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
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          disabled={loading || !acceptedAgreement || !codeValid || validatingCode}
          sx={{ mt: 3 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Register for Beta Program'}
        </Button>
      </form>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          By registering, you agree to keep all beta features confidential as outlined in the agreement.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          For questions about the beta program, please contact{' '}
          <Link href="mailto:beta@edpsych-connect.com">beta@edpsych-connect.com</Link>
        </Typography>
      </Box>
    </Paper>
  );
};

export default BetaRegistrationForm;