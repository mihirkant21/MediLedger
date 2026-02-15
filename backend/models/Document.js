const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true
  },
  documentType: {
    type: String,
    enum: ['prescription', 'lab-report', 'xray', 'mri', 'ct-scan', 'doctor-note', 'other'],
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String
  },
  fileSize: {
    type: Number
  },
  mimeType: {
    type: String
  },

  // Medical metadata
  patientName: {
    type: String,
    trim: true
  },
  patientAge: {
    type: String,
    trim: true
  },
  patientGender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    trim: true
  },
  doctorName: {
    type: String,
    trim: true
  },
  hospitalName: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  },
  diagnosis: {
    type: String,
    trim: true
  },
  medicines: [{
    type: String,
    trim: true
  }],
  symptoms: [{
    type: String,
    trim: true
  }],
  tests: [{
    type: String,
    trim: true
  }],

  // OCR data
  ocrText: {
    type: String
  },
  ocrStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  ocrJobId: {
    type: String
  },
  ocrConfidence: {
    type: Number,
    min: 0,
    max: 100
  },

  // Blockchain data
  blockchainHash: {
    type: String
  },
  blockchainTxHash: {
    type: String
  },
  blockchainVerified: {
    type: Boolean,
    default: false
  },
  blockchainTimestamp: {
    type: Date
  },

  // Access control
  isPrivate: {
    type: Boolean,
    default: true
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Tags and categories
  tags: [{
    type: String,
    trim: true
  }],

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
documentSchema.index({ user: 1, createdAt: -1 });
documentSchema.index({ user: 1, documentType: 1 });
documentSchema.index({ blockchainHash: 1 });
documentSchema.index({ date: -1 });

// Virtual for formatted date
documentSchema.virtual('formattedDate').get(function () {
  return this.date ? this.date.toLocaleDateString() : null;
});

// Ensure virtuals are included in JSON
documentSchema.set('toJSON', { virtuals: true });
documentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Document', documentSchema);
