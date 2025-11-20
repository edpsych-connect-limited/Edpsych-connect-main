import React, { useState } from 'react';
import { Button, Card, Container, Typography, Box, Chip, Divider, Switch, FormControlLabel, Tooltip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';

// Enhanced styling for pricing cards
const PricingCard = styled(Card)(({ theme, featured }: { theme?: any, featured: boolean }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(3),
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  position: 'relative',
  overflow: 'visible',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[10],
  },
  ...(featured && {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
    borderStyle: 'solid',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -15,
      right: 20,
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      zIndex: 1,
    },
  }),
}));

// Feature badge styling
const FeatureBadge = styled(Box)(({ theme }: { theme?: any }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  '& svg': {
    marginRight: theme.spacing(1),
  },
}));

// Types for our pricing structure
interface PricingFeature {
  name: string;
  description?: string;
  included: boolean;
}

interface PricingTier {
  id: 'standard' | 'professional' | 'institution' | 'research_basic' | 'research_advanced' | 'research_institutional';
  title: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  featured?: boolean;
  features: PricingFeature[];
  buttonText: string;
  buttonVariant: 'outlined' | 'contained';
  stripeProductId: string;
}

const mainPricingTiers: PricingTier[] = [
  {
    id: 'standard',
    title: 'Standard',
    description: 'Essential AI-assisted educational tools with UK curriculum alignment',
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    currency: '£',
    features: [
      { name: 'AI-Assisted Learning', included: true },
      { name: 'Battle Royale Game', included: true },
      { name: 'UK Curriculum Alignment', included: true },
      { name: 'Basic Analytics', included: true },
      { name: 'Up to 3 Student Profiles', included: true },
      { name: 'Specialized AI Agents', included: false },
      { name: 'ML-Powered Assessment', included: false },
      { name: 'Curriculum Adaptation', included: false },
      { name: 'LMS Integration', included: false },
      { name: 'Multi-User Administration', included: false },
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outlined',
    stripeProductId: 'prod_standard',
  },
  {
    id: 'professional',
    title: 'Professional',
    description: 'Advanced tools for education professionals with ML-powered assessment',
    monthlyPrice: 24.99,
    annualPrice: 249.99,
    currency: '£',
    featured: true,
    features: [
      { name: 'AI-Assisted Learning', included: true },
      { name: 'Battle Royale Game', included: true },
      { name: 'UK Curriculum Alignment', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'Up to 100 Student Profiles', included: true },
      { name: 'Specialized AI Agents', included: true },
      { name: 'ML-Powered Assessment', included: true },
      { name: 'Curriculum Adaptation', included: true },
      { name: 'LMS Integration', included: false },
      { name: 'Multi-User Administration', included: false },
    ],
    buttonText: 'Upgrade Now',
    buttonVariant: 'contained',
    stripeProductId: 'prod_professional',
  },
  {
    id: 'institution',
    title: 'Institution',
    description: 'Complete platform for schools and educational institutions',
    monthlyPrice: 99.99,
    annualPrice: 999.99,
    currency: '£',
    features: [
      { name: 'AI-Assisted Learning', included: true },
      { name: 'Battle Royale Game', included: true },
      { name: 'UK Curriculum Alignment', included: true },
      { name: 'Enterprise Analytics', included: true },
      { name: 'Unlimited Student Profiles', included: true },
      { name: 'Specialized AI Agents', included: true },
      { name: 'ML-Powered Assessment', included: true },
      { name: 'Curriculum Adaptation', included: true },
      { name: 'LMS Integration', included: true },
      { name: 'Multi-User Administration', included: true },
    ],
    buttonText: 'Contact Sales',
    buttonVariant: 'outlined',
    stripeProductId: 'prod_institution',
  },
];

const researchPricingTiers: PricingTier[] = [
  {
    id: 'research_basic',
    title: 'Research Basic',
    description: 'Essential tools for individual researchers and small projects',
    monthlyPrice: 39.99,
    annualPrice: 399.99,
    currency: '£',
    features: [
      { name: 'All Professional Features', included: true },
      { name: 'Anonymized Data Export (Basic)', included: true },
      { name: 'Research Publication Support', included: true },
      { name: 'Study Management Tools', included: true },
      { name: 'Up to 100 Research Participants', included: true },
      { name: 'Evidence Synthesis', included: false },
      { name: 'Statistical Analysis', included: false },
      { name: 'Collaborative Research', included: false },
      { name: 'Unlimited Data Export', included: false },
      { name: 'Advanced Visualization', included: false },
    ],
    buttonText: 'Start Researching',
    buttonVariant: 'outlined',
    stripeProductId: 'prod_research_basic',
  },
  {
    id: 'research_advanced',
    title: 'Research Advanced',
    description: 'Comprehensive tools for research teams and departments',
    monthlyPrice: 89.99,
    annualPrice: 899.99,
    currency: '£',
    featured: true,
    features: [
      { name: 'All Research Basic Features', included: true },
      { name: 'Up to 1000 Research Participants', included: true },
      { name: 'Evidence Synthesis', included: true },
      { name: 'Statistical Analysis', included: true },
      { name: 'Collaborative Research', included: true },
      { name: 'LMS Integration', included: true },
      { name: 'Multi-User Administration', included: true },
      { name: 'Advanced Security', included: true },
      { name: 'Unlimited Data Export', included: false },
      { name: 'Advanced Visualization', included: false },
    ],
    buttonText: 'Upgrade Research',
    buttonVariant: 'contained',
    stripeProductId: 'prod_research_advanced',
  },
  {
    id: 'research_institutional',
    title: 'Research Institutional',
    description: 'Enterprise-grade research platform for large institutions',
    monthlyPrice: 199.99,
    annualPrice: 1999.99,
    currency: '£',
    features: [
      { name: 'All Research Advanced Features', included: true },
      { name: 'Unlimited Research Participants', included: true },
      { name: 'Unlimited Data Export', included: true },
      { name: 'Institutional Integration', included: true },
      { name: 'Advanced Visualization', included: true },
      { name: 'Dedicated Research Support', included: true },
      { name: 'Enterprise Support', included: true },
      { name: 'Custom Data Pipelines', included: true },
      { name: 'Priority Feature Development', included: true },
      { name: 'White Labeling Options', included: true },
    ],
    buttonText: 'Contact Research Team',
    buttonVariant: 'outlined',
    stripeProductId: 'prod_research_institutional',
  },
];

export default function PricingTiers() {
  const [annualBilling, setAnnualBilling] = useState(true);
  const [showResearchTiers, setShowResearchTiers] = useState(false);
  const router = useRouter();

  const handleSubscribe = (tier: PricingTier) => {
    // Navigate to checkout with the selected tier
    router.push({
      pathname: '/checkout',
      query: { 
        tier: tier.id,
        billing: annualBilling ? 'annual' : 'monthly',
        product: tier.stripeProductId
      },
    });
  };

  const toggleBilling = () => {
    setAnnualBilling(!annualBilling);
  };

  const toggleTierType = () => {
    setShowResearchTiers(!showResearchTiers);
  };

  const renderPricingTiers = (tiers: PricingTier[]) => {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {tiers.map((tier) => (
          <Box key={tier.id} sx={{ flex: '1 1 300px', maxWidth: '380px', minWidth: '280px' }}>
            <PricingCard featured={tier.featured || false}>
              {tier.featured && (
                <Chip
                  label="MOST POPULAR"
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -16,
                    right: 24,
                    fontWeight: 'bold',
                  }}
                />
              )}
              <Typography component="h3" variant="h4" color="text.primary">
                {tier.title}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ minHeight: 60 }}>
                {tier.description}
              </Typography>
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography component="h4" variant="h3" color="text.primary">
                  {tier.currency}{annualBilling ? tier.annualPrice : tier.monthlyPrice}
                  <Typography variant="h6" color="text.secondary" component="span">
                    {annualBilling ? '/year' : '/month'}
                  </Typography>
                </Typography>
                {annualBilling && (
                  <Typography variant="subtitle2" color="success.main">
                    Save {Math.round(100 - (tier.annualPrice / (tier.monthlyPrice * 12)) * 100)}%
                  </Typography>
                )}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ flexGrow: 1 }}>
                {tier.features.map((feature, index) => (
                  <FeatureBadge key={index}>
                    {feature.included ? (
                      <CheckIcon sx={{ color: 'success.main' }} />
                    ) : (
                      <CloseIcon sx={{ color: 'text.disabled' }} />
                    )}
                    <Typography
                      variant="body2"
                      color={feature.included ? 'text.primary' : 'text.disabled'}
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      {feature.name}
                      {feature.description && (
                        <Tooltip title={feature.description} arrow>
                          <InfoOutlinedIcon sx={{ ml: 0.5, fontSize: '0.9rem' }} />
                        </Tooltip>
                      )}
                    </Typography>
                  </FeatureBadge>
                ))}
              </Box>
              <Box sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  variant={tier.buttonVariant}
                  color="primary"
                  onClick={() => handleSubscribe(tier)}
                >
                  {tier.buttonText}
                </Button>
              </Box>
            </PricingCard>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Container component="section" maxWidth="lg" sx={{ py: 8 }}>
      <Typography component="h2" variant="h3" align="center" color="text.primary" gutterBottom>
        Pricing
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" component="p" sx={{ mb: 6 }}>
        Choose the plan that best fits your needs. All plans include access to our core AI-powered learning platform.
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, gap: 4, flexWrap: 'wrap' }}>
        <FormControlLabel
          control={<Switch checked={annualBilling} onChange={toggleBilling} color="primary" />}
          label={
            <Typography variant="body1">
              Annual Billing <Chip label="Save up to 20%" size="small" color="success" />
            </Typography>
          }
        />
        
        <FormControlLabel
          control={<Switch checked={showResearchTiers} onChange={toggleTierType} color="primary" />}
          label={
            <Typography variant="body1">
              Research Tiers
            </Typography>
          }
        />
      </Box>

      {showResearchTiers ? renderPricingTiers(researchPricingTiers) : renderPricingTiers(mainPricingTiers)}
      
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Need a custom solution for your organization?
        </Typography>
        <Button variant="outlined" color="primary" onClick={() => router.push('/contact')}>
          Contact Our Sales Team
        </Button>
      </Box>
    </Container>
  );
}