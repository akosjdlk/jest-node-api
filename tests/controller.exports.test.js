jest.mock('../model/model', () => ({
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
}));

const controller = require('../controller/controller');

describe('controller exports', () => {
    test.each([
        'postMovie',
        'getMovies',
        'getMovieById',
        'patchMovie',
        'deleteMovie'
    ])('cannot find %s as a function', handlerName => {
        expect(controller[handlerName]).toEqual(expect.any(Function));
    });
});
