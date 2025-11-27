/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Skeleton,
  useMediaQuery,
  useTheme,
  Paper
} from '@mui/material';
import {
  VerifiedUser as VerifiedUserIcon,
  School as SchoolIcon
} from '@mui/icons-material';

const FeaturedAlgorithms = ({ algorithms = [], isLoading = false }) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // If loading, show skeleton
  if (isLoading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Featured Algorithms
        </Typography>
        <Skeleton variant="rectangular" height={400} width="100%" />
      </Box>
    );
  }

  // If no featured algorithms, don't show section
  if (!algorithms || algorithms.length === 0) {
    return null;
  }

  // Handle click on an algorithm
  const handleAlgorithmClick = (algorithmId) => {
    router.push(`/algorithms/${algorithmId}`);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Featured Algorithms
      </Typography>

      <Box>
        {algorithms.map((algorithm) => (
          <FeaturedAlgorithmItem 
            key={algorithm.id} 
            algorithm={algorithm} 
            onClick={() => handleAlgorithmClick(algorithm.id)}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        ))}
      </Box>
    </Box>
  );
};

const FeaturedAlgorithmItem = ({ algorithm, onClick, isMobile, isTablet }) => {
  // Get the lowest price license for display
  const getLowestPrice = () => {
    if (!algorithm.licenses || algorithm.licenses.length === 0) {
      return null;
    }

    const sortedLicenses = [...algorithm.licenses].sort((a, b) => a.price - b.price);
    return sortedLicenses[0];
  };

  const lowestPriceLicense = getLowestPrice();
  
  // Format the price for display
  const formatPrice = (license) => {
    if (!license) return 'Price on request';
    
    if (license.price === 0) {
      return 'Free';
    }
    
    const formatter = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: license.currency || 'GBP'
    });
    
    const price = formatter.format(license.price);
    
    if (license.type === 'subscription') {
      return `${price}/${license.billingCycle.slice(0, 2)}`;
    }
    
    if (license.type === 'per_use') {
      return `${price}/use`;
    }
    
    return price;
  };

  return (
    <Paper 
      elevation={3}
      sx={{ 
        height: { xs: 400, md: 380 },
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Background image with gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${algorithm.thumbnail || '/images/algorithm-placeholder.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%)'
          }
        }}
      />

      {/* Content */}
      <Grid 
        container 
        sx={{ 
          position: 'relative', 
          height: '100%', 
          zIndex: 1,
          p: { xs: 2, md: 4 } 
        }}
      >
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          {/* Category */}
          <Box sx={{ mb: 1 }}>
            <Typography 
              variant="overline"
              sx={{ 
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                display: 'inline-block'
              }}
            >
              {algorithm.categoryName || 'Uncategorized'}
            </Typography>
          </Box>

          {/* Title */}
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h2" 
            gutterBottom
            sx={{ color: 'common.white', fontWeight: 'bold' }}
          >
            {algorithm.name}
          </Typography>

          {/* Creator */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SchoolIcon fontSize="small" sx={{ mr: 0.5, color: 'common.white' }} />
            <Typography variant="body1" sx={{ color: 'common.white' }}>
              {algorithm.creatorName}
              {algorithm.status === 'approved' && (
                <VerifiedUserIcon 
                  fontSize="small" 
                  sx={{ ml: 0.5, color: 'success.light', verticalAlign: 'middle' }}
                />
              )}
            </Typography>
          </Box>

          {/* Description */}
          {!isMobile && (
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'common.white', 
                mb: 3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {algorithm.description}
            </Typography>
          )}

          {/* Action Button */}
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={onClick}
              size={isMobile ? "small" : "medium"}
            >
              View Details
            </Button>

            {/* Price Badge */}
            <Typography 
              variant="subtitle1" 
              component="span"
              sx={{ 
                ml: 2, 
                color: 'common.white',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontWeight: 'bold'
              }}
            >
              {formatPrice(lowestPriceLicense)}
            </Typography>
          </Box>
        </Grid>

        {/* Metrics Box - only show on larger screens */}
        {!isTablet && (
          <Grid item md={4} sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
            <Card sx={{ maxWidth: 250, opacity: 0.9 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Key Metrics
                </Typography>
                
                {algorithm.metrics?.accuracy && (
                  <Typography variant="body2" gutterBottom>
                    Accuracy: {algorithm.metrics.accuracy}%
                  </Typography>
                )}
                
                {algorithm.totalUsage > 0 && (
                  <Typography variant="body2" gutterBottom>
                    Total Usage: {algorithm.totalUsage.toLocaleString()}
                  </Typography>
                )}
                
                {algorithm.ratingCount > 0 && (
                  <Typography variant="body2" gutterBottom>
                    Rating: {algorithm.averageRating.toFixed(1)}/5 ({algorithm.ratingCount} reviews)
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default FeaturedAlgorithms;