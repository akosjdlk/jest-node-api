
const mongoose = require('mongoose');

/**
 * Handles errors and sends an appropriate HTTP response.
 *
 * @param {import('express').Response} res
 * @param {unknown} error
 * @returns {import('express').Response}
 */
module.exports = function handleError(res, error) {
    // Mongoose validation error
    if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: Object.values(error.errors).map(err => err.message)
        });
    }

    // Invalid MongoDB ObjectId or type casting
    if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({
            message: 'Invalid data type or ID'
        });
    }

    // Document not found
    if (error instanceof mongoose.Error.DocumentNotFoundError) {
        return res.status(404).json({
            message: 'Resource not found'
        });
    }

    // MongoDB duplicate key error
    if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
    ) {

        return res.status(409).json({
            message: 'Duplicate value',
            // @ts-ignore
            field: Object.keys(error.keyValue || {})[0] || null
        })
    }

    // Unexpected error
    console.error(error);

    return res.status(500).json({
        message: 'Internal server error'
    });
};
