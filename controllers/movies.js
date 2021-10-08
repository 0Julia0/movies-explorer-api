const Movie = require('../models/movies');

const BadRequestError = require('../errors/badRequestError');
const NotFoundError = require('../errors/notFoundError');
const ForbiddenError = require('../errors/forbiddenError');

const {
  incorrectFilmDataErrorText, movieNotFoundErrorText, forbiddenErrorText,
} = require('../utils/constants');

const getMovies = (req, res, next) => {
  const owner = req.user._id;
  Movie.find({ owner })
    .then((movies) => {
      if (!movies) {
        return res.send({});
      }
      return res.send(movies);
    })
    .catch(next);
};

const createMovie = (req, res, next) => {
  const {
    country, director, duration, year, description,
    image, trailer, nameRU, nameEN, thumbnail, movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => res.send(movie))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        throw new BadRequestError(incorrectFilmDataErrorText);
      } else {
        next(error);
      }
    })
    .catch(next);
};

const deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError(movieNotFoundErrorText);
      }
      if (movie.owner.toString() !== req.user._id.toString()) {
        throw new ForbiddenError(forbiddenErrorText);
      }
      return Movie.findByIdAndRemove(req.params.movieId)
        .then(() => res.status(200).send({ message: 'Фильм удален.' }));
    })
    .catch(next);
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
