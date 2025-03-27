import { 
  ScanCommand, 
  QueryCommand,
  GetItemCommand
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { docClient } from '../aws/awsConfig';
import { DocumentItem } from '../types/document.types';

// Table name from environment variables
const documentsTable = import.meta.env.VITE_AWS_DYNAMODB_DOCUMENTS_TABLE || 'Documents';

/**
 * Transform raw DynamoDB document to our application format
 * Extracts tags and category from the nested structure
 */
const transformDocumentItem = (rawItem: Record<string, any>): DocumentItem => {
  const item = unmarshall(rawItem) as any;
  
  // Extract the first category and its tags
  let category = '';
  let tags: string[] = [];
  
  if (item.tags) {
    // Get the first category key
    const categories = Object.keys(item.tags);
    if (categories.length > 0) {
      category = categories[0];
      
      // Extract tags from the first category
      const categoryTags = item.tags[category];
      if (Array.isArray(categoryTags)) {
        tags = categoryTags;
      }
    }
  }
  
  return {
    id: item.id,
    content: item.content,
    name: item.name,
    original_file_path: item.original_file_path,
    page_location: item.page_location,
    precompute_tax_relevant_info: item.precompute_tax_relevant_info,
    tags,
    category
  };
};

/**
 * Get all document items from DynamoDB
 */
export const getAllDocuments = async (): Promise<DocumentItem[]> => {
  const params = {
    TableName: documentsTable
  };

  try {
    const { Items } = await docClient.send(new ScanCommand(params));
    if (!Items || Items.length === 0) return [];
    
    return Items.map((item: Record<string, any>) => transformDocumentItem(item));
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
};

/**
 * Get a document by its ID
 */
export const getDocumentById = async (id: string): Promise<DocumentItem | null> => {
  const params = {
    TableName: documentsTable,
    Key: {
      id: { S: id }
    }
  };

  try {
    const { Item } = await docClient.send(new GetItemCommand(params));
    if (!Item) return null;
    
    return transformDocumentItem(Item);
  } catch (error) {
    console.error('Error getting document by id:', error);
    throw error;
  }
};

/**
 * Query documents by original file path
 */
export const getDocumentsByFilePath = async (filePath: string): Promise<DocumentItem[]> => {
  // For this to work efficiently, you would need a GSI (Global Secondary Index) on original_file_path
  // This is a simplified approach that might not be optimal for large datasets
  const params = {
    TableName: documentsTable,
    FilterExpression: 'original_file_path = :filePath',
    ExpressionAttributeValues: {
      ':filePath': { S: filePath }
    }
  };

  try {
    const { Items } = await docClient.send(new ScanCommand(params));
    if (!Items || Items.length === 0) return [];
    
    return Items.map((item: Record<string, any>) => transformDocumentItem(item));
  } catch (error) {
    console.error('Error querying documents by file path:', error);
    throw error;
  }
};

/**
 * Get documents by tag
 */
export const getDocumentsByTag = async (tag: string): Promise<DocumentItem[]> => {
  // This is a simplified approach and might not be efficient for large datasets
  // In a production environment, consider creating a GSI for tags or using a different query approach
  try {
    const { Items } = await docClient.send(new ScanCommand({ TableName: documentsTable }));
    if (!Items || Items.length === 0) return [];
    
    // Filter documents that contain the tag
    return Items
      .map((item: Record<string, any>) => transformDocumentItem(item))
      .filter((doc: DocumentItem) => doc.tags.includes(tag));
      
  } catch (error) {
    console.error('Error getting documents by tag:', error);
    throw error;
  }
};

/**
 * Get documents by category
 */
export const getDocumentsByCategory = async (category: string): Promise<DocumentItem[]> => {
  // This is a simplified approach and might not be efficient for large datasets
  try {
    const { Items } = await docClient.send(new ScanCommand({ TableName: documentsTable }));
    if (!Items || Items.length === 0) return [];
    
    // Filter documents with the matching category
    return Items
      .map((item: Record<string, any>) => transformDocumentItem(item))
      .filter((doc: DocumentItem) => doc.category === category);
      
  } catch (error) {
    console.error('Error getting documents by category:', error);
    throw error;
  }
};