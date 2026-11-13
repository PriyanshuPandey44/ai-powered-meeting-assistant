const AppError = require('../utils/AppError');

const notFound = (req, res, next) => next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';

  if (err.type === 'entity.parse.failed') { status = 400; message = 'Request body is not valid JSON'; }
  else if (err.type === 'entity.too.large') { status = 413; message = 'Request is too large'; }
  else if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join(', '); }
  else if (err.name === 'CastError') { status = 400; message = 'Invalid meeting id'; }
  else if (!err.status) { console.error(err); message = 'Internal server error'; }

  res.status(status).json({ success: false, error: message });
};

module.exports = { notFound, errorHandler };
