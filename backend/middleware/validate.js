const validate = (schema) => (req, res, next) => {
  try {
    // Merge req.body and any parsed metadata from form-data if present
    let dataToValidate = { ...req.body };
    
    if (req.body.metadata && typeof req.body.metadata === 'string') {
        try {
            const parsedMetadata = JSON.parse(req.body.metadata);
            dataToValidate = { ...dataToValidate, ...parsedMetadata };
        } catch (e) {
            // ignore JSON parse error for metadata, zod will catch validation errors
        }
    }

    const parsedData = schema.parse(dataToValidate);
    req.validatedData = parsedData;
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      console.error('Validation failed:', messages);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }
    next(error);
  }
};

module.exports = validate;
