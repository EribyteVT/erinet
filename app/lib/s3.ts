import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.LIGHTSAIL_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  endpoint: process.env.LIGHTSAIL_ENDPOINT,
});

export const uploadToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> => {
  const key = `${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.LIGHTSAIL_BUCKET_NAME!,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: "public-read", // Makes the file publicly accessible
  });

  await s3Client.send(command);
  
  // Return the public URL
  return `https://${process.env.LIGHTSAIL_BUCKET_NAME}.s3.${process.env.LIGHTSAIL_BUCKET_REGION}.amazonaws.com/${key}`;
};

export const deleteFromS3 = async (fileUrl: string): Promise<void> => {
  // Extract the key from the URL
  const key = fileUrl.split(".com/")[1];
  
  const command = new DeleteObjectCommand({
    Bucket: process.env.LIGHTSAIL_BUCKET_NAME!,
    Key: key,
  });

  await s3Client.send(command);
};