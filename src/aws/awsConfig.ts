import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

// AWS Configuration
const region = import.meta.env.VITE_AWS_REGION || 'us-east-1';
const s3region = 'us-east-2';
const credentials = {
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
  secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
};

// Create DynamoDB clients
const dynamoClient = new DynamoDBClient({
  region,
  credentials,
});

// Create the DynamoDB Document client for easier interaction
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Create S3 client
const s3Client = new S3Client({
  region: s3region,
  credentials,
});

export { dynamoClient, docClient, s3Client }; 