import dotenv from 'dotenv';

dotenv.config();

// Set default cloud provider for testing
process.env.TEST_CLOUD_PROVIDER = process.env.TEST_CLOUD_PROVIDER || 'xiangong';