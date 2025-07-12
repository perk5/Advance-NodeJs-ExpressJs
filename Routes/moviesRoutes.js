const express = require('express')
const movieController = require('../Controllers/moviesController.js')
const routerer = express.Router()
const authController = require('../Controllers/authController.js')

// routerer.param('id', movieController.checkId)


routerer.route('/').get(authController.protect, movieController.getAllMovies).post(movieController.addNewMovie)

routerer.route('/movie-stats').get(movieController.getMovieStats)

routerer.route('/movies-by-genre/:genre').get(movieController.getMovieByGenre)

routerer.route('/:id').get(movieController.getSpecificMovie).put(movieController.updateMovie).delete(authController.protect, authController.restrict('admin'), movieController.deleteMovie)

module.exports = routerer 