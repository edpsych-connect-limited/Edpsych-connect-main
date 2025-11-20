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
  tooltip?: string;
}

interface PricingTier {
  id: 'classroom' | 'school' | 'trust' | 'research_basic' | 'research_advanced' | 'research_institutional';
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

// UK EDUCATION PRICING TIERS
const ukEducationTiers: PricingTier[] = [
  {
    id: 'classroom',
    title: 'Classroom',
    description: 'Perfect for individual teachers and small groups',
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    currency: '£',
    features: [
      { name: 'Up to 30 pupils', included: true },
      { name: 'Voice Interface: "How is Jamie doing?"', included: true, tooltip: 'Natural language queries with instant insights' },
      { name: '3 Core AI Agents', included: true, tooltip: 'Student Mentor, Assessment Generator, Feedback Agent' },
      { name: 'UK Curriculum Alignment (KS1-4)', included: true },
      { name: 'Basic progress tracking', included: true },
      { name: 'Parent communication portal', included: true },
      { name: 'Battle Royale educational game', included: true },
      { name: 'Email support', included: true },
      { name: 'All 11 AI Agents', included: false },
      { name: 'Advanced analytics & predictions', included: false },
      { name: 'Relationship mapping (Neo4j)', included: false },
      { name: 'Multi-class management', included: false },
      { name: 'SIMS/Arbor integration', included: false },
      { name: 'Burnout prevention system', included: false },
    ],
    buttonText: 'Start Free Trial',
    buttonVariant: 'outlined',
    stripeProductId: 'prod_standard',
  },
  {
    id: 'school',
    title: 'School',
    description: 'Complete solution for primary and secondary schools',
    monthlyPrice: 99.99,
    annualPrice: 999.99,
    currency: '£',
    featured: true,
    features: [
      { name: 'Unlimited pupils', included: true },
      { name: 'All 11 AI Agents', included: true, tooltip: 'Curriculum Designer, Learning Path Optimiser, Assessment Generator, Progress Analyst, Intervention Specialist, Student Mentor, Tutor, Coaching, Feedback, Monitoring' },
      { name: 'Voice control with instant insights', included: true },
      { name: 'Full UK curriculum mapping', included: true },
      { name: 'Relationship analytics (Neo4j graphs)', included: true, tooltip: 'Visualise and optimise support networks' },
      { name: 'Staff burnout prevention', included: true, tooltip: 'Proactive workload monitoring' },
      { name: 'Battle Royale gamification', included: true },
      { name: 'Advanced predictive analytics', included: true },
      { name: 'SIMS/Arbor integration', included: true },
      { name: 'Ofsted reporting tools', included: true },
      { name: 'SEND support features', included: true },
      { name: 'Adaptive learning paths', included: true },
      { name: 'Cognitive assessments', included: true },
      { name: 'Priority email & chat support', included: true },
      { name: 'Multi-school management', included: false },
      { name: 'Custom AI development', included: false },
      { name: 'White-label options', included: false },
    ],
    buttonText: 'Start 30-Day Trial',
    buttonVariant: 'contained',
    stripeProductId: 'prod_professional',
  },
  {
    id: 'trust',
    title: 'Academy Trust',
    description: 'Enterprise solution for multi-academy trusts',
    monthlyPrice: 499.99,
    annualPrice: 4999.99,
    currency: '£',
    features: [
      { name: 'Everything in School tier', included: true },
      { name: 'Multi-school centralised dashboard', included: true },
      { name: 'Cross-school analytics & benchmarking', included: true },
      { name: 'Custom AI agent development', included: true },
      { name: 'White-label branding', included: true },
      { name: 'Full API access', included: true },
      { name: 'On-premise deployment option', included: true },
      { name: 'Dedicated success manager', included: true },
      { name: '24/7 phone support', included: true },
      { name: 'SLA guarantee', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Priority feature development', included: true },
      { name: 'Unlimited data export', included: true },
      { name: 'Advanced security features', included: true },
    ],
    buttonText: 'Contact Sales',
    buttonVariant: 'outlined',
    stripeProductId: 'prod_institution',
  },
];

// UK RESEARCH PRICING TIERS
const ukResearchTiers: PricingTier[] = [
  {
    id: 'research_basic',
    title: 'Research Basic',
    description: 'For individual researchers and PhD students',
    monthlyPrice: 39.99,
    annualPrice: 399.99,
    currency: '£',
    features: [
      { name: 'All School tier features', included: true },
      { name: 'Anonymised data export', included: true },
      { name: 'Research publication support', included: true },
      { name: 'Study management tools', included: true },
      { name: 'Up to 100 research participants', included: true },
      { name: 'Basic statistical analysis', included: true },
      { name: 'Research ethics templates', included: true },
      { name: 'Evidence synthesis tools', included: false },
      { name: 'Advanced statistical modelling', included: false },
      { name: 'Collaborative research workspace', included: false },
      { name: 'Unlimited data export', included: false },
      { name: 'Custom visualisations', included: false },
    ],
    buttonText: 'Start Research',
    buttonVariant: 'outlined',
    stripeProductId: 'prod_research_basic',
  },
  {
    id: 'research_advanced',
    title: 'Research Advanced',
    description: 'For research teams and university departments',
    monthlyPrice: 89.99,
    annualPrice: 899.99,
    currency: '£',
    featured: true,
    features: [
      { name: 'All Research Basic features', included: true },
      { name: 'Up to 1000 research participants', included: true },
      { name: 'Evidence synthesis tools', included: true },
      { name: 'Advanced statistical analysis', included: true },
      { name: 'Collaborative research workspace', included: true },
      { name: 'Cohort analysis tools', included: true },
      { name: 'Predictive modelling', included: true },
      { name: 'Custom data pipelines', included: true },
      { name: 'Multi-user administration', included: true },
      { name: 'Advanced security features', included: true },
      { name: 'Unlimited data export', included: false },
      { name: 'Custom visualisation builder', included: false },
      { name: 'White-label options', included: false },
    ],
    buttonText: 'Upgrade Research',
    buttonVariant: 'contained',
    stripeProductId: 'prod_research_advanced',
  },
  {
    id: 'research_institutional',
    title: 'Research Institutional',
    description: 'For universities and large research centres',
    monthlyPrice: 199.99,
    annualPrice: 1999.99,
    currency: '£',
    features: [
      { name: 'All Research Advanced features', included: true },
      { name: 'Unlimited research participants', included: true },
      { name: 'Unlimited data export', included: true },
      { name: 'Custom visualisation builder', included: true },
      { name: 'Institutional API integration', included: true },
      { name: 'Dedicated research support team', included: true },
      { name: 'Enterprise-grade security', included: true },
      { name: 'Custom data retention policies', included: true },
      { name: 'Priority feature development', included: true },
      { name: 'White-labelling options', included: true },
      { name: 'On-premise deployment', included: true },
      { name: 'Custom training programmes', included: true },
    ],
    buttonText: 'Contact Research Team',
    buttonVariant: 'outlined',
    stripeProductId: 'prod_research_institutional',
  },
];

// UK Compliance badges component
const ComplianceBadges = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 3 }}>
    <Chip label="🇬🇧 UK Data Centre" color="primary" variant="outlined" />
    <Chip label="GDPR Compliant" color="success" variant="outlined" />
    <Chip label="Ofsted Ready" color="info" variant="outlined" />
    <Chip label="ICO Registered" color="secondary" variant="outlined" />
  </Box>
);

export default function UKPricingTiers() {
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
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
        {tiers.map((tier) => (
          <Box key={tier.id} sx={{ flex: '1 1 350px', maxWidth: '400px', minWidth: '320px' }}>
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
                      {feature.tooltip && (
                        <Tooltip title={feature.tooltip} arrow>
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
        Transparent Pricing for UK Schools
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" component="p" sx={{ mb: 4 }}>
        Choose the perfect plan for your educational setting. All plans include our core AI-powered learning platform.
      </Typography>

      <ComplianceBadges />

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

      {showResearchTiers ? renderPricingTiers(ukResearchTiers) : renderPricingTiers(ukEducationTiers)}
      
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          All prices exclude VAT • Educational discounts available
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
          Need a bespoke solution for your academy trust?
        </Typography>
        <Button variant="outlined" color="primary" onClick={() => router.push('/contact')}>
          Contact Our UK Sales Team
        </Button>
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h6" gutterBottom>
          🎯 Complete Feature List
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>11 AI Agents:</strong> Curriculum Designer • Learning Path Optimiser • Assessment Generator • 
          Progress Analyst • Intervention Specialist • Student Mentor • Tutor • Coaching • Feedback • Monitoring • 
          Assessment Agents
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          <strong>Core Features:</strong> Voice Interface • Battle Royale Game • UK Curriculum (KS1-4) • 
          Relationship Analytics (Neo4j) • Burnout Prevention • SIMS/Arbor Integration • Ofsted Reporting • 
          SEND Support • Adaptive Learning • Cognitive Assessments • Parent Portal • Real-time Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          <strong>Research Tools:</strong> Anonymised Export • Statistical Analysis • Evidence Synthesis • 
          Cohort Analysis • Predictive Modelling • Publication Support
        </Typography>
      </Box>
    </Container>
  );
}