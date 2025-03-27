import { 
  ScanCommand, 
  QueryCommand,
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand, 
  UpdateItemCommand,
  ReturnValue
} from '@aws-sdk/client-dynamodb';
import { 
  marshall, 
  unmarshall 
} from '@aws-sdk/util-dynamodb';
import { docClient } from './awsConfig';

/**
 * Get all items from a DynamoDB table
 * @param tableName - The DynamoDB table name
 */
export const getAllItems = async (tableName: string) => {
  const params = {
    TableName: tableName
  };

  try {
    const { Items } = await docClient.send(new ScanCommand(params));
    return Items ? Items.map(item => unmarshall(item)) : [];
  } catch (error) {
    console.error('Error getting all items:', error);
    throw error;
  }
};

/**
 * Get an item by its key from a DynamoDB table
 * @param tableName - The DynamoDB table name
 * @param key - The primary key of the item
 */
export const getItemById = async (tableName: string, key: Record<string, any>) => {
  const params = {
    TableName: tableName,
    Key: marshall(key)
  };

  try {
    const { Item } = await docClient.send(new GetItemCommand(params));
    return Item ? unmarshall(Item) : null;
  } catch (error) {
    console.error('Error getting item by ID:', error);
    throw error;
  }
};

/**
 * Query items from a DynamoDB table
 * @param tableName - The DynamoDB table name
 * @param keyConditionExpression - KeyConditionExpression for the query
 * @param expressionAttributeValues - ExpressionAttributeValues for the query
 */
export const queryItems = async (
  tableName: string,
  keyConditionExpression: string,
  expressionAttributeValues: Record<string, any>
) => {
  const params = {
    TableName: tableName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: marshall(expressionAttributeValues)
  };

  try {
    const { Items } = await docClient.send(new QueryCommand(params));
    return Items ? Items.map(item => unmarshall(item)) : [];
  } catch (error) {
    console.error('Error querying items:', error);
    throw error;
  }
};

/**
 * Put an item into a DynamoDB table
 * @param tableName - The DynamoDB table name
 * @param item - The item to put
 */
export const putItem = async (tableName: string, item: Record<string, any>) => {
  const params = {
    TableName: tableName,
    Item: marshall(item)
  };

  try {
    return await docClient.send(new PutItemCommand(params));
  } catch (error) {
    console.error('Error putting item:', error);
    throw error;
  }
};

/**
 * Update an item in a DynamoDB table
 * @param tableName - The DynamoDB table name
 * @param key - The primary key of the item
 * @param updateExpression - UpdateExpression for the update
 * @param expressionAttributeValues - ExpressionAttributeValues for the update
 */
export const updateItem = async (
  tableName: string,
  key: Record<string, any>,
  updateExpression: string,
  expressionAttributeValues: Record<string, any>
) => {
  const params = {
    TableName: tableName,
    Key: marshall(key),
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: marshall(expressionAttributeValues),
    ReturnValues: 'ALL_NEW' as ReturnValue
  };

  try {
    const { Attributes } = await docClient.send(new UpdateItemCommand(params));
    return Attributes ? unmarshall(Attributes) : null;
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

/**
 * Delete an item from a DynamoDB table
 * @param tableName - The DynamoDB table name
 * @param key - The primary key of the item
 */
export const deleteItem = async (tableName: string, key: Record<string, any>) => {
  const params = {
    TableName: tableName,
    Key: marshall(key)
  };

  try {
    return await docClient.send(new DeleteItemCommand(params));
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
}; 