
const Model = require('../model/model');
const handleError = require('./errorHandler');

/**
 * @typedef {Object} PostMovieBody
 * @property {string} title
 * @property {string} director
 * @property {number} year
 * @property {string} genre
 */

/**
 * @typedef {Partial<PostMovieBody>} PatchMovieBody
 */

/**
 * @typedef {Object} MovieIdParams
 * @property {string} id
 */

/**
 * Create a movie.
 *
 * @type {import('express').RequestHandler<{}, any, PostMovieBody>}
 */
module.exports.postMovie = async (req, res) => {
    try {
        const newMovie = await Model.create(req.body);

        return res.status(201).json(newMovie);
    } catch (error) {
        return handleError(res, error);
    }
};

/**
 * Get all movies.
 *
 * @type {import('express').RequestHandler}
 */
module.exports.getMovies = async (req, res) => {
    try {
        const movies = await Model.find();

        return res.status(200).json(movies);
    } catch (error) {
        return handleError(res, error);
    }
};

/**
 * Get a movie by ID.
 *
 * @type {import('express').RequestHandler<MovieIdParams>}
 */
module.exports.getMovieById = async (req, res) => {
    try {
        const movie = await Model.findById(req.params.id).orFail();

        return res.status(200).json(movie);
    } catch (error) {
        return handleError(res, error);
    }
};

/**
 * Partially update a movie.
 *
 * @type {import('express').RequestHandler<MovieIdParams, any, PatchMovieBody>}
 */
module.exports.patchMovie = async (req, res) => {
    try {
        const updatedMovie = await Model.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            {
                new: true,
                runValidators: true
            }
        ).orFail();

        return res.status(200).json(updatedMovie);
    } catch (error) {
        return handleError(res, error);
    }
};

/**
 * Delete a movie by ID.
 *
 * @type {import('express').RequestHandler<MovieIdParams>}
 */
module.exports.deleteMovie = async (req, res) => {
    try {
        await Model.findByIdAndDelete(req.params.id).orFail();

        return res.status(204).send();
    } catch (error) {
        return handleError(res, error);
    }
};
