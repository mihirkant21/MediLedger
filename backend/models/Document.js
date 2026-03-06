const { docClient } = require('../config/dynamodb');
const { PutCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const TABLE_NAME = process.env.DYNAMODB_DOCUMENTS_TABLE || 'documents';

// Helper to remove undefined or empty string fields which DynamoDB rejects
const cleanData = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== '')
  );
};

// createDocument(data) — puts item
const createDocument = async (data) => {
  const documentId = crypto.randomUUID();
  const now = new Date().toISOString();

  let docItem = {
    ...data,
    documentId,
    createdAt: now,
    updatedAt: now,
  };
  
  docItem = cleanData(docItem);

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: docItem,
  });

  await docClient.send(command);
  return docItem;
};

// getDocumentById(userId, documentId) — get by both keys
const getDocumentById = async (userId, documentId) => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'userId = :userId AND documentId = :documentId',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':documentId': documentId,
    },
  });

  const response = await docClient.send(command);
  return response.Items && response.Items.length > 0 ? response.Items[0] : null;
};

// getDocumentsByUser(userId) — query by partition key, sorted by createdAt descending
const getDocumentsByUser = async (userId) => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
    // Since documentId is the sort key, we don't natively sort by createdAt unless we have an LSI/GSI.
    // For now we query all and sort in memory if needed, or if we define a GSI on userId/createdAt.
    // Assuming simple table structure without complex GSIs for now, we sort in memory:
  });

  const response = await docClient.send(command);
  if (!response.Items) return [];
  
  return response.Items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// getDocumentsByUserAndType(userId, documentType) — query with FilterExpression
const getDocumentsByUserAndType = async (userId, documentType) => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'userId = :userId',
    FilterExpression: 'documentType = :documentType',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':documentType': documentType,
    },
  });

  const response = await docClient.send(command);
  if (!response.Items) return [];
  
  return response.Items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// updateDocument(userId, documentId, updates) — UpdateExpression patch
const updateDocument = async (userId, documentId, updates) => {
  const now = new Date().toISOString();
  
  const setFields = {};
  const removeFields = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === '') {
      removeFields.push(key);
    } else {
      setFields[key] = value;
    }
  }
  
  setFields.updatedAt = now;

  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  if (Object.keys(setFields).length > 0) {
    const setExprs = [];
    for (const [key, value] of Object.entries(setFields)) {
      setExprs.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = value;
    }
    updateExpressions.push(`SET ${setExprs.join(', ')}`);
  }

  if (removeFields.length > 0) {
    const removeExprs = [];
    for (const key of removeFields) {
      removeExprs.push(`#${key}`);
      expressionAttributeNames[`#${key}`] = key;
    }
    updateExpressions.push(`REMOVE ${removeExprs.join(', ')}`);
  }

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { userId, documentId },
    UpdateExpression: updateExpressions.join(' '),
    ExpressionAttributeNames: expressionAttributeNames,
    ...(Object.keys(expressionAttributeValues).length > 0 && { ExpressionAttributeValues: expressionAttributeValues }),
    ReturnValues: 'ALL_NEW',
  });

  const response = await docClient.send(command);
  return response.Attributes;
};

// deleteDocument(userId, documentId) — delete item
const deleteDocument = async (userId, documentId) => {
  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { userId, documentId },
  });

  await docClient.send(command);
  return { success: true };
};

// getDocumentByHash(blockchainHash) — scan with FilterExpression on blockchainHash
const getDocumentByHash = async (blockchainHash) => {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: 'blockchainHash = :hash',
    ExpressionAttributeValues: {
      ':hash': blockchainHash,
    },
  });

  const response = await docClient.send(command);
  return response.Items && response.Items.length > 0 ? response.Items[0] : null;
};

// Generic get all documents
const getAllDocuments = async () => {
    const command = new ScanCommand({
        TableName: TABLE_NAME,
    });
    const response = await docClient.send(command);
    if (!response.Items) return [];
    
    return response.Items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = {
  createDocument,
  getDocumentById,
  getDocumentsByUser,
  getDocumentsByUserAndType,
  updateDocument,
  deleteDocument,
  getDocumentByHash,
  getAllDocuments
};
