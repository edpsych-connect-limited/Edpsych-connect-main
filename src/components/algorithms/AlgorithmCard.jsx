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
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Rating,
  Stack,
  Divider
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  VerifiedUser as VerifiedUserIcon,
  Code as CodeIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const AlgorithmCard = ({ algorithm }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/algorithms/${algorithm.id}`);
  };

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
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[6]
        }
      }}
    >
      <CardActionArea 
        onClick={handleClick}
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          height: '100%'
        }}
      >
        {/* Thumbnail */}
        <CardMedia
          component="img"
          height="140"
          image={algorithm.thumbnail || '/images/algorithm-placeholder.jpg'}
          alt={algorithm.name}
        />
        
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Category */}
          <Box sx={{ mb: 1 }}>
            <Chip 
              label={algorithm.categoryName || 'Uncategorized'} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
            {algorithm.featured && (
              <Chip 
                label="Featured" 
                size="small"
                color="secondary"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          
          {/* Title */}
          <Typography 
            gutterBottom 
            variant="h6" 
            component="h2"
            sx={{ 
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.2,
              height: '2.4em'
            }}
          >
            {algorithm.name}
          </Typography>
          
          {/* Description */}
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              flex: 1
            }}
          >
            {algorithm.description}
          </Typography>
          
          <Divider sx={{ my: 1 }} />
          
          {/* Creator */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SchoolIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {algorithm.creatorName}
              {algorithm.status === 'approved' && (
                <VerifiedUserIcon 
                  fontSize="small" 
                  sx={{ ml: 0.5, color: 'success.main', verticalAlign: 'middle' }}
                />
              )}
            </Typography>
          </Box>
          
          {/* Metrics */}
          <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
            {algorithm.totalUsage > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CodeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {algorithm.totalUsage.toLocaleString()} uses
                </Typography>
              </Box>
            )}
            
            {algorithm.ratingCount > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Rating 
                  value={algorithm.averageRating} 
                  readOnly 
                  size="small"
                  precision={0.5}
                  sx={{ mr: 0.5 }}
                />
                <Typography variant="body2" color="text.secondary">
                  ({algorithm.ratingCount})
                </Typography>
              </Box>
            )}
          </Stack>
          
          {/* Updated time */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Updated {formatDistanceToNow(new Date(algorithm.updatedAt), { addSuffix: true })}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          {/* Price and Status */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
            {/* Status */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleOutlineIcon 
                fontSize="small" 
                sx={{ mr: 0.5, color: algorithm.status === 'approved' ? 'success.main' : 'text.disabled' }}
              />
              <Typography variant="body2" color={algorithm.status === 'approved' ? 'success.main' : 'text.disabled'}>
                {algorithm.status === 'approved' ? 'Verified' : 'Pending'}
              </Typography>
            </Box>
            
            {/* Price */}
            <Typography variant="subtitle1" fontWeight="bold" color="primary">
              {formatPrice(lowestPriceLicense)}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default AlgorithmCard;