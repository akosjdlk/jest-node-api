const mongoose = require('mongoose');

/**
 * Creates a mock for a Mongoose query using .orFail().
 *
 * @template T
 * @param {T} result
 * @returns {{orFail: jest.Mock<Promise<T>, []>}}
 */
function mockOrFailQuery(result) {
    return {
        orFail: jest.fn().mockResolvedValue(result)
    };
}

/**
 * Creates a mock Express request.
 *
 * @returns {{body: {}, params: {id: string}}}
 */
function createRequest() {
    return {
        body: {},
        params: {
            id: ''
        }
    };
}

/**
 * Creates a mock Express response.
 *
 * @returns {{status: jest.Mock, json: jest.Mock}}
 */
function createResponse() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    };
}

/**
 * Creates a mock Express next function.
 *
 * @returns {jest.Mock}
 */
function createNext() {
    return jest.fn();
}

/**
 * Creates a DocumentNotFoundError for testing.
 *
 * @returns {mongoose.Error.DocumentNotFoundError}
 */
function createNotFoundError() {
    return Object.create(
        mongoose.Error.DocumentNotFoundError.prototype
    );
}

module.exports = {
    mockOrFailQuery,
    createRequest,
    createResponse,
    createNext,
    createNotFoundError
};
