export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}

export function notFound(req, res, next) {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(err, req, res, next) {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';

    // PostgreSQL-specific error codes
    if (err.code === '23505') {
        statusCode = 409;
        message = 'A record with this unique value already exists (e.g., email).';
    } else if (err.code === '23503') {
        statusCode = 409;
        message = 'Cannot delete this record because it is referenced by existing appointments.';
    } else if (err.code === '22P02') {
        statusCode = 400;
        message = 'Invalid ID or input format.';
    } else if (err.code === '23514') {
        statusCode = 400;
        message = 'Input value violates database constraints.';
    }

    if (statusCode >= 500) {
        console.error('Server Error:', err);
    }

    res.status(statusCode).json({
        success: false,
        error: message,
    });
}