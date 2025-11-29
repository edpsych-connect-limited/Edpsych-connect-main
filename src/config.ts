/**
 * Application-wide configuration
 */
export const config = {
  appName: 'EdPsych Connect' as const,
  version: (process.env.APP_VERSION || '1.0.0') as string,
  isProduction: process.env.NODE_ENV === 'production',
  // Use a separate environment variable for staging detection
  isStaging: process.env.ENV_TYPE === 'staging' || false,
  isDevelopment: process.env.NODE_ENV === 'development',
  api: {
    baseUrl: (process.env.NEXT_PUBLIC_API_URL || '') as string,
    timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
    retryCount: parseInt(process.env.API_RETRY_COUNT || '3', 10),
  },
  monitoring: {
    enabled: process.env.ENABLE_MONITORING === 'true',
    sampleRate: parseFloat(process.env.MONITORING_SAMPLE_RATE || '1.0'), // 1.0 = 100%
    logLevel: (process.env.LOG_LEVEL || 'info') as string,
  },
  features: {
    aiEnabled: process.env.ENABLE_AI === 'true',
    professionalNetworkingEnabled: process.env.ENABLE_PROFESSIONAL_NETWORKING === 'true',
    trainingEnabled: process.env.ENABLE_TRAINING === 'true',
  }
};