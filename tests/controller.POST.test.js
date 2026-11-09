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
    createRequest,
    createResponse,
    createNext
} = require('./controllerTestUtils');

describe('postMovie', () => {
    let req;
    let next;
    let res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = createRequest();
        res = createResponse();
        next = createNext();
    });

    test('creates a movie and returns status 201', async () => {
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

    test('returns 400 when the movie data is invalid', async () => {
        req.body = { genre: '' };

        const error = new mongoose.Error.ValidationError();
        error.addError(
            'genre',
            new mongoose.Error.ValidatorError({
                message: 'Genre is required',
                path: 'genre',
                value: ''
            })
        );

        Model.create.mockRejectedValue(error);

        await controller.postMovie(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Validation failed',
            errors: ['Genre is required']
        });
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
