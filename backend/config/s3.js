const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

const uploadToS3 = async (file, userId) => {
  const fileExtension = file.originalname.split('.').pop();
  const uuid = require('crypto').randomUUID();
  const key = `documents/${userId}/${uuid}-${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  // Generate a pre-signed URL (valid for 7 days) if the bucket isn't public,
  // or return a standard URL if public. For simplicity we'll assume standard URL
  // but let's implement presigned URL as it's safer for medical documents.
  const getCommand = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  
  const fileUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 604800 }); // 7 days

  return { key, fileUrl };
};

const deleteFromS3 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
};

module.exports = { s3Client, uploadToS3, deleteFromS3 };
