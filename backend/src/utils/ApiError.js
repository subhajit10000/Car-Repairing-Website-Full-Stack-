class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = []) {
    super(message);

    this.success = false;
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.timestamp = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true 
  });
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
