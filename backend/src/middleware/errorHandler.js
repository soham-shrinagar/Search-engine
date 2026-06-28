function errorHandler(err, req, res, next) {
  console.error(err.stack || err.message);

  const status = err.status || err.statusCode || 500;
  const showMessage =
    process.env.NODE_ENV !== 'production' ||
    status < 500 ||
    err.expose === true;

  const message = showMessage
    ? err.message || 'Something went wrong.'
    : 'Internal server error';

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorHandler, asyncHandler };
