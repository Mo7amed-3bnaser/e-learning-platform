/**
 * Validates required environment variables at startup.
 * Throws an error immediately if any required variable is missing,
 * preventing the server from starting with a broken config.
 */
const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'CLIENT_URL',
];

const OPTIONAL_WITH_DEFAULTS = {
  PORT: '5000',
  NODE_ENV: 'development',
  CLIENT_URL: 'http://localhost:3000',
};

export const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    // Use console here because logger may not be initialized yet at startup
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('\nCopy .env.example to .env and fill in the required values.');
    process.exit(1);
  }

  // Apply defaults for optional vars
  Object.entries(OPTIONAL_WITH_DEFAULTS).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
    }
  });

  // Warn about weak JWT secret in production
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET is too short for production (< 32 chars)');
  }
};
