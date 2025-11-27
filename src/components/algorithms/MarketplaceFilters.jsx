/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import AlgorithmService from '../../algorithm/services/AlgorithmService';

const MarketplaceFilters = ({ filters, onFilterChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Get algorithm categories for the category filter
  const { data: categories } = useQuery(
    ['algorithmCategories'],
    () => AlgorithmService.getCategories(),
    {
      // Provide fallback data in case the API is not implemented yet
      placeholderData: [
        { id: 'assessment', name: 'Assessment' },
        { id: 'intervention', name: 'Intervention' },
        { id: 'analytics', name: 'Analytics' },
        { id: 'personalization', name: 'Personalization' },
        { id: 'research', name: 'Research' }
      ]
    }
  );

  // Handle category change
  const handleCategoryChange = (event) => {
    onFilterChange({ category: event.target.value });
  };

  // Handle sort change
  const handleSortChange = (event) => {
    onFilterChange({ sort: event.target.value });
  };

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
        Filters & Sorting
      </Typography>

      <Stack spacing={2} direction={isMobile ? "row" : "column"} sx={{ width: '100%' }}>
        {/* Category Filter */}
        <FormControl fullWidth size="small">
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            id="category-select"
            value={filters.category || ''}
            label="Category"
            onChange={handleCategoryChange}
            displayEmpty
          >
            <MenuItem value="">All Categories</MenuItem>
            <Divider />
            {categories?.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sort Order */}
        <FormControl fullWidth size="small">
          <InputLabel id="sort-label">Sort By</InputLabel>
          <Select
            labelId="sort-label"
            id="sort-select"
            value={filters.sort || 'newest'}
            label="Sort By"
            onChange={handleSortChange}
          >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="popularity">Most Popular</MenuItem>
            <MenuItem value="rating">Highest Rated</MenuItem>
            <MenuItem value="price_low">Price: Low to High</MenuItem>
            <MenuItem value="price_high">Price: High to Low</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Box>
  );
};

export default MarketplaceFilters;