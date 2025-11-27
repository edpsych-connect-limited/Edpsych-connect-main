/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

/**
 * Schema for tracking algorithm usage
 * 
 * This model stores each instance of algorithm execution, including
 * who used it, when it was used, performance metrics, and billing information.
 * This data is essential for license enforcement, usage tracking, and royalty calculations.
 */
const AlgorithmUsageSchema = new Schema(
  {
    // Core relationships
    algorithmId: {
      type: Schema.Types.ObjectId,
      ref: 'Algorithm',
      required: true,
      index: true,
    },
    algorithmVersionId: {
      type: Schema.Types.ObjectId,
      ref: 'AlgorithmVersion',
      required: true,
    },
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
      index: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    licenseId: {
      type: Schema.Types.ObjectId,
      ref: 'AlgorithmLicense',
      required: true,
      index: true,
    },

    // Usage metadata
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    inputHash: {
      type: String,
      required: false,
      description: 'Hash of input parameters for audit and caching',
    },
    inputContext: {
      type: Object,
      required: false,
      description: 'Anonymized context of algorithm input (types, sizes, etc.)',
    },

    // Performance metrics
    executionTime: {
      type: Number, // in milliseconds
      required: true,
      description: 'Time taken to execute the algorithm',
    },
    cpuUsage: {
      type: Number,
      required: false,
      description: 'CPU resources used during execution',
    },
    memoryUsage: {
      type: Number,
      required: false,
      description: 'Memory used during execution in MB',
    },

    // Execution details
    resultStatus: {
      type: String,
      enum: ['success', 'error', 'timeout', 'canceled'],
      required: true,
      index: true,
    },
    errorMessage: {
      type: String,
      required: false,
    },
    errorType: {
      type: String,
      required: false,
    },
    outputHash: {
      type: String,
      required: false,
      description: 'Hash of output for audit purposes',
    },
    outputSummary: {
      type: Object,
      required: false,
      description: 'Anonymized summary of algorithm output (types, sizes, etc.)',
    },

    // Device and environment information
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'server', 'other'],
      required: false,
    },
    browserInfo: {
      type: String,
      required: false,
    },
    ipAddress: {
      type: String,
      required: false,
    },
    geolocation: {
      country: String,
      region: String,
      city: String,
    },

    // Billing and royalty information
    licenseType: {
      type: String,
      enum: ['subscription', 'per_use', 'unlimited'],
      required: true,
      index: true,
    },
    billingAmount: {
      type: Number,
      required: true,
      default: 0,
      description: 'Amount charged for this usage instance',
    },
    currency: {
      type: String,
      required: true,
      default: 'GBP',
    },
    royaltyCalculated: {
      type: Boolean,
      default: false,
      description: 'Whether royalty has been calculated for this usage',
    },
    royaltyAmount: {
      type: Number,
      required: false,
      description: 'Creator royalty amount for this usage',
    },
    royaltyPercentage: {
      type: Number,
      required: false,
      description: 'Percentage of billing amount allocated to creator',
    },
    royaltyPaidDate: {
      type: Date,
      required: false,
      description: 'Date when royalty was paid to creator',
    },
    royaltyPaymentId: {
      type: String,
      required: false,
      description: 'Reference to payment record',
    },

    // Additional metadata
    tags: [String],
    notes: String,
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Indexes for common queries
AlgorithmUsageSchema.index({ algorithmId: 1, timestamp: -1 });
AlgorithmUsageSchema.index({ institutionId: 1, timestamp: -1 });
AlgorithmUsageSchema.index({ licenseId: 1, timestamp: -1 });
AlgorithmUsageSchema.index({ algorithmId: 1, institutionId: 1, timestamp: -1 });
AlgorithmUsageSchema.index({ algorithmId: 1, licenseType: 1, timestamp: -1 });
AlgorithmUsageSchema.index({ royaltyCalculated: 1, timestamp: 1 });

// Virtual for calculating total cost
AlgorithmUsageSchema.virtual('totalCost').get(function() {
  return this.billingAmount || 0;
});

// Static methods for common queries
AlgorithmUsageSchema.statics.getUsageByAlgorithm = async function(algorithmId, startDate, endDate, options = {}) {
  const query = { 
    algorithmId,
    timestamp: {}
  };
  
  if (startDate) {
    query.timestamp.$gte = startDate;
  }
  
  if (endDate) {
    query.timestamp.$lte = endDate;
  }
  
  if (!Object.keys(query.timestamp).length) {
    delete query.timestamp;
  }
  
  if (options.licenseType) {
    query.licenseType = options.licenseType;
  }
  
  if (options.institutionId) {
    query.institutionId = options.institutionId;
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(options.limit || 100)
    .skip(options.skip || 0);
};

// Static method for aggregating usage statistics
AlgorithmUsageSchema.statics.getUsageStats = async function(algorithmId, startDate, endDate, groupBy = 'day') {
  const match = { algorithmId };
  
  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) match.timestamp.$gte = startDate;
    if (endDate) match.timestamp.$lte = endDate;
  }
  
  let dateFormat;
  switch (groupBy) {
    case 'hour':
      dateFormat = { $dateToString: { format: '%Y-%m-%d %H:00', date: '$timestamp' } };
      break;
    case 'day':
      dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } };
      break;
    case 'week':
      // MongoDB doesn't have a direct week formatter, so we'll use this approximation
      dateFormat = { 
        $dateToString: { 
          format: '%G-W%V', 
          date: '$timestamp' 
        } 
      };
      break;
    case 'month':
      dateFormat = { $dateToString: { format: '%Y-%m', date: '$timestamp' } };
      break;
    default:
      dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } };
  }
  
  return this.aggregate([
    { $match: match },
    { 
      $group: {
        _id: dateFormat,
        count: { $sum: 1 },
        totalRevenue: { $sum: '$billingAmount' },
        avgExecutionTime: { $avg: '$executionTime' },
        maxExecutionTime: { $max: '$executionTime' },
        successCount: { 
          $sum: { 
            $cond: [{ $eq: ['$resultStatus', 'success'] }, 1, 0] 
          } 
        },
        errorCount: { 
          $sum: { 
            $cond: [{ $eq: ['$resultStatus', 'error'] }, 1, 0] 
          } 
        }
      }
    },
    { 
      $project: {
        _id: 0,
        date: '$_id',
        usage: '$count',
        revenue: '$totalRevenue',
        avgResponseTime: '$avgExecutionTime',
        maxResponseTime: '$maxExecutionTime',
        successRate: { 
          $multiply: [
            { $divide: ['$successCount', { $add: ['$successCount', '$errorCount'] }] },
            100
          ]
        }
      }
    },
    { $sort: { date: 1 } }
  ]);
};

// Static method to get license distribution
AlgorithmUsageSchema.statics.getLicenseDistribution = async function(algorithmId, startDate, endDate) {
  const match = { algorithmId };
  
  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) match.timestamp.$gte = startDate;
    if (endDate) match.timestamp.$lte = endDate;
  }
  
  return this.aggregate([
    { $match: match },
    { 
      $group: {
        _id: '$licenseType',
        count: { $sum: 1 },
        revenue: { $sum: '$billingAmount' }
      }
    },
    { 
      $project: {
        _id: 0,
        type: '$_id',
        value: '$count',
        revenue: '$revenue'
      }
    }
  ]);
};

// Static method to get top institutions
AlgorithmUsageSchema.statics.getTopInstitutions = async function(algorithmId, startDate, endDate, limit = 5) {
  const match = { algorithmId };
  
  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) match.timestamp.$gte = startDate;
    if (endDate) match.timestamp.$lte = endDate;
  }
  
  return this.aggregate([
    { $match: match },
    { 
      $group: {
        _id: '$institutionId',
        count: { $sum: 1 },
        revenue: { $sum: '$billingAmount' }
      }
    },
    {
      $lookup: {
        from: 'institutions',
        localField: '_id',
        foreignField: '_id',
        as: 'institution'
      }
    },
    { $unwind: '$institution' },
    { 
      $project: {
        _id: 0,
        id: '$_id',
        name: '$institution.name',
        usage: '$count',
        revenue: '$revenue'
      }
    },
    { $sort: { usage: -1 } },
    { $limit: limit }
  ]);
};

// Method to record a successful algorithm usage
AlgorithmUsageSchema.statics.recordUsage = async function(usageData) {
  return this.create(usageData);
};

// Method to calculate royalty for usage records
AlgorithmUsageSchema.statics.calculateRoyalties = async function(startDate, endDate) {
  const match = { 
    royaltyCalculated: false 
  };
  
  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) match.timestamp.$gte = startDate;
    if (endDate) match.timestamp.$lte = endDate;
  }
  
  // Get all usage records that need royalty calculation
  const usageRecords = await this.find(match);
  
  // For each usage record, calculate royalty and update
  for (const record of usageRecords) {
    // In a real implementation, we would fetch the algorithm to get the royalty percentage
    // For now, we'll use a default of 70%
    const royaltyPercentage = 70; // This would come from the algorithm or license
    const royaltyAmount = (record.billingAmount * royaltyPercentage) / 100;
    
    record.royaltyCalculated = true;
    record.royaltyAmount = royaltyAmount;
    record.royaltyPercentage = royaltyPercentage;
    
    await record.save();
  }
  
  return usageRecords.length;
};

const AlgorithmUsage = mongoose.model('AlgorithmUsage', AlgorithmUsageSchema);

export default AlgorithmUsage;