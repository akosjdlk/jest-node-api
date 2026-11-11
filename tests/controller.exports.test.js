const controller = require('../controller/controller');

describe('controller exports', () => {
    test.each([
        'postMovie',
        'getMovies',
        'getMovieById',
        'patchMovie',
        'deleteMovie'
    ])('cannot find %s as a function', handlerName => {
        expect(typeof controller[handlerName]).toBe('function');
    });
});

