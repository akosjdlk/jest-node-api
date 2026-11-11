const mongoose = require('mongoose');
const handleError = require('../controller/errorHandler');

describe('errorHandler', () => {
    let res;

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    describe('ValidationError', () => {
        test('returns 400 for validation errors', () => {
            const error = new mongoose.Error.ValidationError();

            error.addError(
                'title',
                new mongoose.Error.ValidatorError({
                    message: 'Title is required',
                    path: 'title',
                    value: ''
                })
            );

            handleError(res, error);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation failed',
                errors: ['Title is required']
            });
        });

        test('returns all validation error messages', () => {
            const error = new mongoose.Error.ValidationError();

            error.addError(
                'title',
                new mongoose.Error.ValidatorError({
                    message: 'Title is required',
                    path: 'title',
                    value: ''
                })
            );
            error.addError(
                'year',
                new mongoose.Error.ValidatorError({
                    message: 'Year must be a number',
                    path: 'year',
                    value: 'unknown'
                })
            );

            handleError(res, error);

            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation failed',
                errors: ['Title is required', 'Year must be a number']
            });
        });

        test('returns an empty error list when no validation errors exist', () => {
            const error = new mongoose.Error.ValidationError();

            handleError(res, error);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation failed',
                errors: []
            });
        });
    });

    describe('CastError', () => {
        test('returns 400 for cast errors', () => {
            const error = new mongoose.Error.CastError(
                'ObjectId',
                'invalid-id',
                '_id'
            );

            handleError(res, error);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Invalid data type or ID'
            });
        });
    });

    describe('DocumentNotFoundError', () => {
        test('returns 404 when a document is not found', () => {
            const error = Object.create(
                mongoose.Error.DocumentNotFoundError.prototype
            );

            handleError(res, error);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Resource not found'
            });
        });
    });

    describe('Duplicate key error', () => {
        test('returns 409 for duplicate values', () => {
            const error = Object.assign(new Error('Duplicate key'), {
                code: 11000,
                keyValue: {
                    title: 'Inception'
                }
            });

            handleError(res, error);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Duplicate value',
                field: 'title'
            });
        });

        test('returns null when duplicate key details are missing', () => {
            const error = Object.assign(new Error('Duplicate key'), {
                code: 11000
            });

            handleError(res, error);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Duplicate value',
                field: null
            });
        });

        test('returns null when duplicate key details are empty', () => {
            const error = Object.assign(new Error('Duplicate key'), {
                code: 11000,
                keyValue: {}
            });

            handleError(res, error);

            expect(res.json).toHaveBeenCalledWith({
                message: 'Duplicate value',
                field: null
            });
        });

        test('returns null when duplicate key details are null', () => {
            const error = Object.assign(new Error('Duplicate key'), {
                code: 11000,
                keyValue: null
            });

            handleError(res, error);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Duplicate value',
                field: null
            });
        });

        test('returns the first field for a multi-field duplicate error', () => {
            const error = Object.assign(new Error('Duplicate key'), {
                code: 11000,
                keyValue: {
                    title: 'Inception',
                    year: 2010
                }
            });

            handleError(res, error);

            expect(res.json).toHaveBeenCalledWith({
                message: 'Duplicate value',
                field: 'title'
            });
        });

        test('does not expose duplicate error details in the response', () => {
            const error = Object.assign(new Error('Sensitive database details'), {
                code: 11000,
                keyValue: {
                    title: 'Inception'
                }
            });

            handleError(res, error);

            expect(res.json).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.anything()
                })
            );
        });

        test('handles a plain duplicate key error object', () => {
            const error = {
                code: 11000,
                keyValue: {
                    title: 'Inception'
                }
            };

            handleError(res, error);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Duplicate value',
                field: 'title'
            });
        });
    });

    describe('Unknown errors', () => {
        test('returns 500 for unexpected errors', () => {
            const error = new Error('Unexpected error');

            const consoleSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            handleError(res, error);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Internal server error'
            });

            expect(consoleSpy).toHaveBeenCalledWith(error);

            consoleSpy.mockRestore();
        });

        test.each([null, undefined, 'Unexpected error'])(
            'returns 500 for an unknown %p value',
            error => {
                const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation(() => {});

                handleError(res, error);

                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    message: 'Internal server error'
                });
                expect(consoleSpy).toHaveBeenCalledWith(error);
                expect(res.status).toHaveBeenCalledTimes(1);
                expect(res.json).toHaveBeenCalledTimes(1);

                consoleSpy.mockRestore();
            }
        );

        test('returns the response object', () => {
            const error = new Error('Unexpected error');
            const consoleSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            const result = handleError(res, error);

            expect(result).toBe(res);

            consoleSpy.mockRestore();
        });
    });
});
