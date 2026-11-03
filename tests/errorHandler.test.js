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
    });
});
