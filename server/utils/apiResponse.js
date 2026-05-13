/**
 * Standardized API Response Utility
 */

export const successResponse = (res, statusCode = 200, message = "Success", data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, statusCode = 500, message = "Error", errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors,
  });
};
