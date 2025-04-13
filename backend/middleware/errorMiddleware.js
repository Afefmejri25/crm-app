// Custom error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.stack || err.message);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || "An unexpected error occurred.",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

// Not found middleware
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
