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
const {
    mockOrFailQuery,
    createNotFoundError
} = require('./controllerTestUtils');
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
                orFail: jest.fn().mockRejectedValue(createNotFoundError())
            });

            await controller.patchMovie(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Resource not found'
            });
        });
    });

});