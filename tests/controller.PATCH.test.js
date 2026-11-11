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

describe('patchMovie', () => {
    let req;
    let next;
    let res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = createRequest();
        res = createResponse();
        next = createNext();
    });

    test('updates a movie and returns status 200', async () => {
        const originalMovie = mockMovies[0];
        const updatedMovie = {
            ...originalMovie,
            title: 'Inception Updated'
        };

        req.params.id = originalMovie._id;
        req.body = { title: 'Inception Updated' };

        const query = mockOrFailQuery(updatedMovie);
        Model.findByIdAndUpdate.mockReturnValue(query);

        await controller.patchMovie(req, res, next);

        expect(Model.findByIdAndUpdate).toHaveBeenCalledWith(
            originalMovie._id,
            { $set: req.body },
            {
                new: true,
                runValidators: true
            }
        );
        expect(query.orFail).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(updatedMovie);
    });

    test('returns 404 when the movie to update does not exist', async () => {
        req.params.id = '507f1f77bcf86cd799439099';

        Model.findByIdAndUpdate.mockReturnValue({
            orFail: jest.fn().mockRejectedValue(createNotFoundError())
        });

        await controller.patchMovie(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Resource not found'
        });
    });

    test('returns 400 when the movie ID is invalid', async () => {
        req.params.id = 'invalid-id';

        Model.findByIdAndUpdate.mockReturnValue({
            orFail: jest.fn().mockRejectedValue(
                new mongoose.Error.CastError('ObjectId', 'invalid-id', '_id')
            )
        });

        await controller.patchMovie(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Invalid data type or ID'
        });
    });

    test('returns 400 when the updated movie data is invalid', async () => {
        req.params.id = mockMovies[0]._id;
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

        Model.findByIdAndUpdate.mockReturnValue({
            orFail: jest.fn().mockRejectedValue(error)
        });

        await controller.patchMovie(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Validation failed',
            errors: ['Genre is required']
        });
    });

    test('handles errors when updating a movie', async () => {
        const error = new Error('Database error');
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        req.params.id = mockMovies[0]._id;
        req.body = { title: 'Inception Updated' };

        Model.findByIdAndUpdate.mockReturnValue({
            orFail: jest.fn().mockRejectedValue(error)
        });

        await controller.patchMovie(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Internal server error'
        });

        consoleSpy.mockRestore();
    });
});
