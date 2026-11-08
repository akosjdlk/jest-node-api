jest.mock('../model/model', () => ({
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
}));

const mongoose = require('mongoose');
const Model = require('../model/model');
const controller = require('../controller/controller');
const mockMovies = require('./mockMovies');
const {
    mockOrFailQuery,
    createRequest,
    createResponse,
    createNext,
    createNotFoundError
} = require('./controllerTestUtils');

describe('deleteMovie', () => {
    let req;
    let next;
    let res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = createRequest();
        res = createResponse();
        next = createNext();
    });

    test('deletes a movie and returns status 204', async () => {
        const movie = mockMovies[0];
        req.params.id = movie._id;

        Model.findByIdAndDelete.mockReturnValue(
            mockOrFailQuery(movie)
        );

        await controller.deleteMovie(req, res, next);

        expect(Model.findByIdAndDelete).toHaveBeenCalledWith(movie._id);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.json).not.toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith();
        expect(res.send).toHaveBeenCalledTimes(1);
    });

    test('calls findByIdAndDelete exactly once', async () => {
        const movie = mockMovies[0];
        req.params.id = movie._id;

        Model.findByIdAndDelete.mockReturnValue(
            mockOrFailQuery(movie)
        );

        await controller.deleteMovie(req, res, next);

        expect(Model.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });

    test('uses orFail when deleting a movie', async () => {
        const movie = mockMovies[0];
        const query = mockOrFailQuery(movie);
        req.params.id = movie._id;

        Model.findByIdAndDelete.mockReturnValue(query);

        await controller.deleteMovie(req, res, next);

        expect(query.orFail).toHaveBeenCalledTimes(1);
    });

    test('returns 404 when the movie ID is empty', async () => {
        const query = {
            orFail: jest.fn().mockRejectedValue(createNotFoundError())
        };

        req.params.id = '';
        Model.findByIdAndDelete.mockReturnValue(query);

        await controller.deleteMovie(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Resource not found'
        });
    });

    test('returns the response object after a successful deletion', async () => {
        const movie = mockMovies[0];
        req.params.id = movie._id;

        Model.findByIdAndDelete.mockReturnValue(
            mockOrFailQuery(movie)
        );

        const result = await controller.deleteMovie(req, res, next);

        expect(result).toBe(res);
    });

    test('returns 404 when the movie to delete does not exist', async () => {
        req.params.id = undefined;

        Model.findByIdAndDelete.mockReturnValue({
            orFail: jest.fn().mockRejectedValue(createNotFoundError())
        });

        await controller.deleteMovie(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Resource not found'
        });
    });

    test('returns 404 when the movie ID is null', async () => {
        req.params.id = null;

        Model.findByIdAndDelete.mockReturnValue({
            orFail: jest.fn().mockRejectedValue(createNotFoundError())
        });

        await controller.deleteMovie(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Resource not found'
        });
    });

    test('returns 400 for an invalid movie ID', async () => {
        const error = new mongoose.Error.CastError(
            'ObjectId',
            'invalid-id',
            '_id'
        );
        req.params.id = 'invalid-id';

        Model.findByIdAndDelete.mockReturnValue({
            orFail: jest.fn().mockRejectedValue(error)
        });

        await controller.deleteMovie(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Invalid data type or ID'
        });
    });

    test('returns 500 for an unexpected database error', async () => {
        const error = new Error('Database error');
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        Model.findByIdAndDelete.mockReturnValue({
            orFail: jest.fn().mockRejectedValue(error)
        });

        await controller.deleteMovie(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Internal server error'
        });
        expect(consoleSpy).toHaveBeenCalledWith(error);

        consoleSpy.mockRestore();
    });
});
