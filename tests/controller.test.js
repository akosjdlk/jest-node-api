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
 * Creates a DocumentNotFoundError for testing.
 * @returns {mongoose.Error.DocumentNotFoundError}
 */
const notFoundError = Object.create(
    mongoose.Error.DocumentNotFoundError.prototype
);

describe('Movie controller', () => {

    let req;
    let next;
    let res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            body: {},
            params: {
                id: ''
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    describe('postMovie', () => {
        test('creates a movie and returns 201', async () => {
            const movie = mockMovies[0];

            req.body = {
                title: movie.title,
                director: movie.director,
                year: movie.year,
                genre: movie.genre
            };

            Model.create.mockResolvedValue(movie);

            await controller.postMovie(req, res, next);

            expect(Model.create).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(movie);
        });

        test('handles errors when creating a movie', async () => {
            const error = new Error('Database error');

            const consoleSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            Model.create.mockRejectedValue(error);

            await controller.postMovie(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Internal server error'
            });

            consoleSpy.mockRestore();
        });
    });

    describe('getMovies', () => {
        test('returns all movies with status 200', async () => {
            Model.find.mockResolvedValue(mockMovies);

            await controller.getMovies(req, res, next);

            expect(Model.find).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockMovies);
        });

        test('returns an empty array when there are no movies', async () => {
            Model.find.mockResolvedValue([]);

            await controller.getMovies(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([]);
        });

        test('handles errors when retrieving movies', async () => {
            const error = new Error('Database error');

            const consoleSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            Model.find.mockRejectedValue(error);

            await controller.getMovies(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
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

            Model.findById.mockReturnValue(
                mockOrFailQuery(movie)
            );

            await controller.getMovieById(req, res, next);

            expect(Model.findById).toHaveBeenCalledWith(movie._id);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(movie);
        });

        test('returns 404 when the movie does not exist', async () => {
            req.params.id = '507f1f77bcf86cd799439099';

            Model.findById.mockReturnValue({
                orFail: jest.fn().mockRejectedValue(notFoundError)
            });

            await controller.getMovieById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Resource not found'
            });
        });
    });

    describe('patchMovie', () => {
        test('updates a movie and returns status 200', async () => {
            const originalMovie = mockMovies[0];

            const updatedMovie = {
                ...originalMovie,
                title: 'Inception Updated'
            };

            req.params.id = originalMovie._id;
            req.body = {
                title: 'Inception Updated'
            };

            Model.findByIdAndUpdate.mockReturnValue(
                mockOrFailQuery(updatedMovie)
            );

            await controller.patchMovie(req, res, next);

            expect(Model.findByIdAndUpdate).toHaveBeenCalledWith(
                originalMovie._id,
                { $set: req.body },
                {
                    new: true,
                    runValidators: true
                }
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updatedMovie);
        });

        test('returns 404 when the movie to update does not exist', async () => {
            req.params.id = '507f1f77bcf86cd799439099';

            Model.findByIdAndUpdate.mockReturnValue({
                orFail: jest.fn().mockRejectedValue(notFoundError)
            });

            await controller.patchMovie(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Resource not found'
            });
        });
    });

    describe('deleteMovie', () => {
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
        });

        test('returns 404 when the movie to delete does not exist', async () => {
            req.params.id = undefined;

            Model.findByIdAndDelete.mockReturnValue({
                orFail: jest.fn().mockRejectedValue(notFoundError)
            });

            await controller.deleteMovie(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Resource not found'
            });
        });
    });
});