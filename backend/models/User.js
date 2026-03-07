const { docClient } = require('../config/dynamodb');
const { PutCommand, GetCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const TABLE_NAME = process.env.DYNAMODB_USERS_TABLE || 'users';

// Helper to remove undefined or empty string fields which DynamoDB rejects
const cleanData = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== '')
  );
};

const createUser = async (data) => {
  const userId = crypto.randomUUID();
  const now = new Date().toISOString();
  
  let userItem = {
    userId,
    ...data,
    email: data.email?.toLowerCase(),
    isVerified: data.isVerified || false,
    role: data.role || 'user',
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: now,
    updatedAt: now,
  };

  userItem = cleanData(userItem);

  if (userItem.password) {
    const salt = await bcrypt.genSalt(10);
    userItem.password = await bcrypt.hash(userItem.password, salt);
  }

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: userItem,
  });

  await docClient.send(command);

  // Return user without password
  const { password, ...userWithoutPassword } = userItem;
  return userWithoutPassword;
};

const getUserById = async (userId) => {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: { userId },
  });

  const response = await docClient.send(command);
  return response.Item;
};

const getUserByEmail = async (email) => {
  // Using Scan with FilterExpression for email (Alternative is GSI on email)
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email.toLowerCase(),
    },
  });

  const response = await docClient.send(command);
  return response.Items && response.Items.length > 0 ? response.Items[0] : null;
};

const updateUser = async (userId, updates) => {
  const now = new Date().toISOString();
  
  // Hash password if being updated
  if (updates.password) {
    const salt = await bcrypt.genSalt(10);
    updates.password = await bcrypt.hash(updates.password, salt);
  }

  // We want to handle explicit nulls by removing them 
  // (e.g. freeing OTP fields) instead of setting them to "null" string
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
    Key: { userId },
    UpdateExpression: updateExpressions.join(' '),
    ExpressionAttributeNames: expressionAttributeNames,
    // ExpressionAttributeValues is optional if there are only REMOVE operations
    ...(Object.keys(expressionAttributeValues).length > 0 && { ExpressionAttributeValues: expressionAttributeValues }),
    ReturnValues: 'ALL_NEW',
  });

  const response = await docClient.send(command);
  return response.Attributes;
};

const comparePassword = async (candidatePassword, hashedPassword) => {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  comparePassword,
};
