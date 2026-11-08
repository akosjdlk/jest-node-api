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
});
