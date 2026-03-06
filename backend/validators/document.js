const { z } = require('zod');

// Keep enum matching existing mongoose models
const documentTypesEnum = ['prescription', 'lab-report', 'xray', 'mri', 'ct-scan', 'doctor-note', 'other'];

const uploadDocumentSchema = z.object({
  title: z.string().nullable().optional().default('Untitled Document'),
  documentType: z.enum(documentTypesEnum).nullable().optional().default('other'),
  patientName: z.string().nullable().optional(),
  patientAge: z.string().nullable().optional(),
  patientGender: z.enum(['Male', 'Female', 'Other', '']).nullable().optional(),
  doctorName: z.string().nullable().optional(),
  hospitalName: z.string().nullable().optional(),
  date: z.string().nullable().optional().or(z.date().nullable().optional()),
  notes: z.string().nullable().optional(),
  diagnosis: z.string().nullable().optional(),
  medicines: z.union([z.string(), z.array(z.string())]).nullable().optional(),
  symptoms: z.union([z.string(), z.array(z.string())]).nullable().optional(),
  tests: z.union([z.string(), z.array(z.string())]).nullable().optional(),
  ocrText: z.string().nullable().optional(),
  ocrStatus: z.enum(['pending', 'processing', 'completed', 'failed', '']).nullable().optional(),
  ocrJobId: z.string().nullable().optional(),
  ocrConfidence: z.coerce.number().min(0).max(100).nullable().optional().or(z.literal('').nullable().optional()),
}).passthrough(); // Metadata attached to FormData can sometimes be dynamic or strings that need parsing

const updateDocumentSchema = uploadDocumentSchema.partial();

module.exports = {
  uploadDocumentSchema,
  updateDocumentSchema,
};
