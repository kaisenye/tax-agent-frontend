import { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  S3ServiceException
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from './awsConfig';

// Helper function to get bucket names from environment variables
const getBucketName = (type: 'documents' | 'uploads' = 'documents'): string => {
  const bucketName = type === 'documents' 
    ? import.meta.env.VITE_AWS_S3_DOCUMENTS_BUCKET 
    : import.meta.env.VITE_AWS_S3_UPLOADS_BUCKET;
  
  if (!bucketName) {
    throw new Error(`S3 ${type} bucket is not configured in environment variables`);
  }
  
  return bucketName;
};

/**
 * Upload a file to the uploads bucket
 * @param key - The S3 object key (file path)
 * @param file - The file to upload (File or Blob)
 * @param contentType - The file's content type (MIME type)
 */
export const uploadFile = async (
  key: string, 
  file: File | Blob, 
  contentType?: string
) => {
  try {
    const bucketName = getBucketName('uploads');
    
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: file,
      ContentType: contentType || file.type,
    };

    const command = new PutObjectCommand(params);
    const response = await s3Client.send(command);
    
    return {
      success: true,
      key: key,
      eTag: response.ETag,
      versionId: response.VersionId,
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

/**
 * Get a file from the documents bucket
 * @param key - The S3 object key (file path)
 */
export const getDocumentFile = async (key: string) => {
  try {
    const bucketName = getBucketName('documents');
    
    const params = {
      Bucket: bucketName,
      Key: key
    };

    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    
    // Convert stream to blob
    if (response.Body) {
      const blob = await response.Body.transformToByteArray();
      return new Blob([blob], { type: response.ContentType });
    }
    
    throw new Error('Empty response body');
  } catch (error) {
    console.error('Error getting file from S3:', error);
    throw error;
  }
};

/**
 * Get a file from the uploads bucket
 * @param key - The S3 object key (file path)
 */
export const getUploadFile = async (key: string) => {
  try {
    const bucketName = getBucketName('uploads');
    
    const params = {
      Bucket: bucketName,
      Key: key
    };

    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    
    // Convert stream to blob
    if (response.Body) {
      const blob = await response.Body.transformToByteArray();
      return new Blob([blob], { type: response.ContentType });
    }
    
    throw new Error('Empty response body');
  } catch (error) {
    console.error('Error getting file from S3:', error);
    throw error;
  }
};

/**
 * Check if a file exists in the documents bucket
 * @param key - The S3 object key (file path)
 * @returns True if the file exists, false otherwise
 */
export const documentExists = async (key: string): Promise<boolean> => {
  try {
    const bucketName = getBucketName('documents');
    
    const params = {
      Bucket: bucketName,
      Key: key
    };

    const command = new HeadObjectCommand(params);
    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error instanceof S3ServiceException && error.name === 'NotFound') {
      return false;
    }
    console.error('Error checking if file exists in S3:', error);
    throw error;
  }
};

/**
 * List files in the documents bucket with an optional prefix
 * @param prefix - Optional prefix to filter objects (folder path)
 */
export const listDocuments = async (prefix?: string) => {
  try {
    const bucketName = getBucketName('documents');
    
    const params = {
      Bucket: bucketName,
      ...(prefix && { Prefix: prefix })
    };

    const command = new ListObjectsV2Command(params);
    const data = await s3Client.send(command);
    
    return data.Contents || [];
  } catch (error) {
    console.error('Error listing files in S3:', error);
    throw error;
  }
};

/**
 * Delete a file from the documents bucket
 * @param key - The S3 object key (file path)
 */
export const deleteDocument = async (key: string) => {
  try {
    const bucketName = getBucketName('documents');
    
    const params = {
      Bucket: bucketName,
      Key: key
    };

    const command = new DeleteObjectCommand(params);
    return await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};

/**
 * Get a signed URL for a file in the documents bucket
 * @param key - The S3 object key (file path)
 * @param expiresIn - URL expiration time in seconds (default: 3600)
 * @returns A promise that resolves to the signed URL string
 */
export const getDocumentSignedUrl = async (key: string, expiresIn = 3600): Promise<string> => {
  try {
    const bucketName = import.meta.env.VITE_AWS_S3_DOCUMENTS_BUCKET;

    if (!bucketName) throw new Error('Documents bucket not configured');
    
    const params = {
      Bucket: bucketName,
      Key: key,
    };
    
    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    
    console.log('Generated signed URL for document:', {
      key: key,
      url: url.substring(0, 100)
    });

    return url;
  } catch (error) {
    console.error('Error generating signed URL for document:', error);
    throw error;
  }
};

/**
 * Get a signed URL for a file in the uploads bucket
 * @param key - The S3 object key (file path)
 * @param expiresIn - URL expiration time in seconds (default: 3600)
 * @returns A promise that resolves to the signed URL string
 */
export const getUploadSignedUrl = async (key: string, expiresIn = 3600): Promise<string> => {
  try {
    const bucketName = import.meta.env.VITE_AWS_S3_UPLOADS_BUCKET;
    if (!bucketName) throw new Error('Uploads bucket not configured');
    
    const params = {
      Bucket: bucketName,
      Key: key
    };
    
    const command = new GetObjectCommand(params);
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating signed URL for upload:', error);
    throw error;
  }
}; 