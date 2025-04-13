// Format error response
export const formatError = (message) => {
  return {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };
};

// Format success response
export const formatSuccess = (data, message = "Opération réussie") => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

// Handle validation errors
export const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map((err) => err.message);
  return {
    success: false,
    message: "Erreur de validation",
    errors,
    timestamp: new Date().toISOString(),
  };
};

// Handle mongoose duplicate key error
export const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  return {
    success: false,
    message: `Un enregistrement avec ce ${field} existe déjà`,
    timestamp: new Date().toISOString(),
  };
};

// Handle mongoose cast error
export const handleCastError = (error) => {
  return {
    success: false,
    message: `Format d'ID invalide: ${error.value}`,
    timestamp: new Date().toISOString(),
  };
}; 