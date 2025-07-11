const express = require('express')
const movieController = require('../Controllers/moviesController.js')
const routerer = express.Router()

// routerer.param('id', movieController.checkId)


routerer.route('/').get(movieController.getAllMovies).post(movieController.addNewMovie)

routerer.route('/movie-stats').get(movieController.getMovieStats)

routerer.route('/movies-by-genre/:genre').get(movieController.getMovieByGenre)

routerer.route('/:id').get(movieController.getSpecificMovie).put(movieController.updateMovie).delete(movieController.deleteMovie)

module.exports = routerer 