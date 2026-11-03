const express = require('express')
const {getMovies, getMovieById, postMovie, patchMovie, deleteMovie} = require("./controller/controller")


const router = express.Router();

router.get("/", getMovies)
router.get("/:id", getMovieById)

router.post("/", postMovie)
router.patch("/:id", patchMovie)

router.get("/:id", deleteMovie)

module.exports = router;