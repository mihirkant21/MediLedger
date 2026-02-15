// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  DOCUMENTS: {
    UPLOAD: '/documents/upload',
    LIST: '/documents',
    TIMELINE: '/documents/timeline',
    DETAIL: '/documents/:id',
    UPDATE: '/documents/:id',
    DELETE: '/documents/:id',
  },
  OCR: {
    EXTRACT: '/ocr/extract',
    PROCESS: '/ocr/process',
    STATUS: '/ocr/status/:jobId',
    CORRECT: '/ocr/correct/:documentId',
  },
  BLOCKCHAIN: {
    HASH: '/blockchain/hash',
    VERIFY: '/blockchain/verify',
    CONTRACT: '/blockchain/contract/:hash',
  },
};

// Document types
export const DOCUMENT_TYPES = [
  { value: 'prescription', label: '💊 Prescription' },
  { value: 'lab-report', label: '🧪 Lab Report' },
  { value: 'xray', label: '📷 X-Ray' },
  { value: 'mri', label: '🧲 MRI' },
  { value: 'ct-scan', label: '🔬 CT Scan' },
  { value: 'doctor-note', label: '📝 Doctor\'s Note' },
  { value: 'other', label: '📄 Other' },
];

// File upload configuration
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  ACCEPTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf'],
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'MediLedger_token',
  USER: 'MediLedger_user',
};
