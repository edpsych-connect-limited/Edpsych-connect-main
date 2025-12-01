/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { monitoringService } from '../services/monitoring/monitoring-service';

/**
 * Middleware for monitoring API performance
 * 
 * This middleware tracks API request latency, errors, and other performance metrics
 * using the monitoring service and CloudWatch integration.
 * 
 * @param req The Next.js API request
 * @param res The Next.js API response
 * @param next The function to call to continue processing the request
 */
export const monitoringMiddleware = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>
) => {
  // Start timing the request
  const startTime = Date.now();
  const originalEnd = res.end;
  const originalWrite = res.write;
  const originalWriteHead = res.writeHead;
  
  let statusCode = 200; // Default status code
  
  // Get the endpoint path from the request
  const endpoint = req.url || 'unknown';

  // Override the writeHead method to capture status code
  res.writeHead = function(this: NextApiResponse, ...args: any[]) {
    statusCode = args[0] as number;
    return (originalWriteHead as any).apply(this, args);
  } as any;
  
  // Override the end method to capture completion time and record metrics
  res.end = function(this: NextApiResponse, ...args: any[]) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Track API latency
    monitoringService.trackApiLatency(endpoint, duration, statusCode).catch(err => {
      console.error('Error tracking API latency:', err);
    });
    
    // Track errors if status code is 4xx or 5xx
    if (statusCode >= 400) {
      const errorType = statusCode >= 500 ? 'ServerError' : 'ClientError';
      monitoringService.trackApiError(endpoint, errorType, statusCode).catch(err => {
        console.error('Error tracking API error:', err);
      });
    }
    
    // Call the original end method
    return (originalEnd as any).apply(this, args);
  } as any;
  
  // Override the write method to ensure it still works properly
  res.write = function(this: NextApiResponse, ...args: any[]) {
    return (originalWrite as any).apply(this, args);
  } as any;
  
  try {
    // Continue processing the request
    await next();
  } catch (_error) {
    // If an _error occurs during processing, track it
    const errorType = _error instanceof Error ? _error.name : 'UnknownError';
    const errorStatusCode = statusCode >= 400 ? statusCode : 500;
    
    monitoringService.trackApiError(endpoint, errorType, errorStatusCode).catch(err => {
      console._error('Error tracking API _error:', err);
    });
    
    // Re-throw the _error to be handled by the API route's _error handler
    throw _error;
  }
};