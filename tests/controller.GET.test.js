jest.mock('../model/model', () => ({
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
}));

const Model = require('../model/model');
const controller = require('../controller/controller');
const mockMovies = require('./mockMovies');
const mongoose = require('mongoose');
const {
    mockOrFailQuery,
    createRequest,
    createResponse,
    createNext,
    createNotFoundError
} = require('./controllerTestUtils');

describe('GET movie endpoints', () => {
    let req;
    let next;
    let res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = createRequest();
        res = createResponse();
        next = createNext();
    });

    describe('getMovies', () => {
        test('returns all movies with status 200', async () => {
            const query = mockOrFailQuery(mockMovies);
            Model.find.mockReturnValue(query);

            await controller.getMovies(req, res, next);

            expect(Model.find).toHaveBeenCalled();
            expect(query.orFail).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockMovies);
        });

        test('returns an empty array when there are no movies', async () => {
            Model.find.mockReturnValue(mockOrFailQuery([]));

            await controller.getMovies(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([]);
        });

        test('handles errors when retrieving movies', async () => {
            const error = new Error('Database error');
            const consoleSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            Model.find.mockReturnValue({
                orFail: jest.fn().mockRejectedValue(error)
            });

            await controller.getMovies(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(consoleSpy).toHaveBeenCalledWith(error);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Internal server error'
            });

            consoleSpy.mockRestore();
        });
    });

    describe('getMovieById', () => {
        test('returns a movie by ID with status 200', async () => {
            const movie = mockMovies[0];
            req.params.id = movie._id;

            const query = mockOrFailQuery(movie);
            Model.findById.mockReturnValue(query);

            await controller.getMovieById(req, res, next);

            expect(Model.findById).toHaveBeenCalledWith(movie._id);
            expect(query.orFail).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(movie);
        });

        test('returns 404 when the movie does not exist', async () => {
            req.params.id = '507f1f77bcf86cd799439099';

            Model.findById.mockReturnValue({
                orFail: jest.fn().mockRejectedValue(createNotFoundError())
            });

            await controller.getMovieById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Resource not found'
            });
        });

        test('returns 400 when the movie ID is invalid', async () => {
            req.params.id = "asd";

            Model.findById.mockReturnValue({
                orFail: jest.fn().mockRejectedValue(
                    new mongoose.Error.CastError('ObjectId', req.params.id, '_id')
                )
            });

            await controller.getMovieById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Invalid data type or ID'
            });
        });

        test('handles errors when retrieving a movie', async () => {
            const error = new Error('Database error');
            const consoleSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            Model.findById.mockReturnValue({
                orFail: jest.fn().mockRejectedValue(error)
            });

            await controller.getMovieById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(consoleSpy).toHaveBeenCalledWith(error);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Internal server error'
            });

            consoleSpy.mockRestore();
        });
    });
});
