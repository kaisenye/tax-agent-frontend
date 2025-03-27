# AWS SDK Setup for Client-Side Applications

This document explains how to set up and use the AWS SDK for JavaScript/TypeScript in your client-side application to interact with Amazon DynamoDB and Amazon S3.

## Prerequisites

- AWS Account with properly configured IAM user/role
- Access to DynamoDB and S3 services
- Basic knowledge of React and TypeScript

## Installation

The following packages have been installed to provide AWS SDK functionality:

```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/client-s3 @aws-sdk/lib-dynamodb @aws-sdk/s3-request-presigner
```

## Configuration

### Environment Variables

Create a `.env` file in the root of your project with the following variables (use `.env.example` as a template):

```
# AWS Configuration
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your_access_key_id_here
VITE_AWS_SECRET_ACCESS_KEY=your_secret_access_key_here

# AWS S3 Bucket Names
VITE_AWS_S3_DOCUMENTS_BUCKET=your-documents-bucket-name
VITE_AWS_S3_UPLOADS_BUCKET=your-uploads-bucket-name

# AWS DynamoDB Table Names
VITE_AWS_DYNAMODB_USERS_TABLE=Users
VITE_AWS_DYNAMODB_DOCUMENTS_TABLE=Documents
VITE_AWS_DYNAMODB_METADATA_TABLE=Metadata
```

> ⚠️ **Security Warning**: Never commit your `.env` file to version control. Make sure it's included in your `.gitignore` file.

## Project Structure

The AWS SDK integration is organized as follows:

- `src/api/awsConfig.ts` - Core AWS SDK configuration
- `src/api/dynamoDBAPI.ts` - DynamoDB operations
- `src/api/s3API.ts` - S3 operations
- `src/examples/AWSExample.tsx` - Example React component

## Security Considerations

### Client-Side Credentials

Using AWS credentials directly in client-side code is **not recommended for production applications** due to the security risk of exposing your credentials. For production applications, consider the following approaches:

1. **Amazon Cognito Identity Pools** - This allows you to generate temporary, limited-privilege credentials for your users.

2. **API Gateway + Lambda** - Create serverless API endpoints that perform AWS operations on behalf of your client app.

3. **Custom Backend Server** - Create a dedicated backend that handles AWS operations and communicates with your frontend via a secure API.

For this demo implementation, we're using direct credentials to simplify the setup, but you should implement a more secure approach for production.

## IAM Policy

Create an IAM policy that grants the minimum required permissions. Example:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:region:account-id:table/your-table-name"
    }
  ]
}
```

## Usage Examples

### DynamoDB Operations

```typescript
import * as dynamoDBAPI from '../api/dynamoDBAPI';

// Get all items from a table
const items = await dynamoDBAPI.getAllItems('YourTableName');

// Get an item by ID
const item = await dynamoDBAPI.getItemById('YourTableName', { id: 'item-id' });

// Query items
const queryResults = await dynamoDBAPI.queryItems(
  'YourTableName',
  'partitionKey = :pk',
  { ':pk': 'partition-key-value' }
);

// Add an item
await dynamoDBAPI.putItem('YourTableName', {
  id: 'unique-id',
  name: 'Item Name',
  data: { key: 'value' }
});

// Update an item
await dynamoDBAPI.updateItem(
  'YourTableName',
  { id: 'item-id' },
  'SET #name = :name, #data = :data',
  { ':name': 'New Name', ':data': { key: 'new-value' } }
);

// Delete an item
await dynamoDBAPI.deleteItem('YourTableName', { id: 'item-id' });
```

### S3 Operations

```typescript
import * as s3API from '../api/s3API';

// List files in a bucket
const files = await s3API.listFiles('your-bucket-name');

// List files with a prefix (folder)
const folderFiles = await s3API.listFiles('your-bucket-name', 'folder/');

// Upload a file
const file = new File(['file content'], 'filename.txt', { type: 'text/plain' });
const result = await s3API.uploadFile('your-bucket-name', 'path/filename.txt', file);

// Get a file
const fileBlob = await s3API.getFile('your-bucket-name', 'path/filename.txt');

// Check if a file exists
const exists = await s3API.fileExists('your-bucket-name', 'path/filename.txt');

// Get a signed URL for temporary access
const signedUrl = await s3API.getSignedUrl('your-bucket-name', 'path/filename.txt', 3600);

// Delete a file
await s3API.deleteFile('your-bucket-name', 'path/filename.txt');
```

See `src/examples/AWSExample.tsx` for a complete example of using these APIs in a React component.

## Resources

- [AWS SDK for JavaScript v3 Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html)
- [Amazon DynamoDB Developer Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
- [Amazon S3 Developer Guide](https://docs.aws.amazon.com/AmazonS3/latest/dev/Welcome.html)
- [AWS Security Best Practices](https://docs.aws.amazon.com/whitepapers/latest/aws-security-best-practices/welcome.html) 