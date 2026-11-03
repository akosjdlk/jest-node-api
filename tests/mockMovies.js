/**
 * @typedef {Object} Movie
 * @property {string} _id
 * @property {string} title
 * @property {string} director
 * @property {number} year
 * @property {string} genre
 */

/** @type {Movie[]} */
const mockMovies = [
    {
        _id: '507f1f77bcf86cd799439011',
        title: 'Inception',
        director: 'Christopher Nolan',
        year: 2010,
        genre: 'Sci-Fi'
    },
    {
        _id: '507f1f77bcf86cd799439012',
        title: 'The Dark Knight',
        director: 'Christopher Nolan',
        year: 2008,
        genre: 'Action'
    },
    {
        _id: '507f1f77bcf86cd799439013',
        title: 'Interstellar',
        director: 'Christopher Nolan',
        year: 2014,
        genre: 'Sci-Fi'
    }
];

module.exports = mockMovies;