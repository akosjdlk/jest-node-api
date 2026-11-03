const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    genre: {
        required: true,
        type: String,
        trim: true,
        minlength: 5,
        maxlength: 50
    },
    releaseDate: {
        required: true,
        type: Date
    },
    actorCount: {
        required: true,
        type: Number,
        min: 1,
        max: 100
    }
})

module.exports = mongoose.model('movie', movieSchema, 'movies')