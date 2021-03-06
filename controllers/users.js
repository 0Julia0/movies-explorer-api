const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

const NotFoundError = require('../errors/notFoundError');
const ConflictingRequest = require('../errors/conflictingRequest');
const BadRequestError = require('../errors/badRequestError');
const UnauthorizedError = require('../errors/unauthorizedError');

const {
  userNotFoundErrorText, userIdNotFoundErrorText, duplicateEmailErrorText,
  incorrectUserDataErrorText, incorrectlyDataErrorText,
} = require('../utils/constants');

const { NODE_ENV, JWT_SECRET } = process.env;

const SALT_ROUNDS = 10;

const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError(userNotFoundErrorText);
      }
      res.send(user);
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { email, name } = req.body;
  User.findByIdAndUpdate(req.user._id,
    {
      email,
      name,
    },
    {
      new: true,
      runValidators: true,
      upsert: false,
    })
    .then((user) => {
      if (!user) {
        throw new NotFoundError(userIdNotFoundErrorText);
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new ConflictingRequest(duplicateEmailErrorText);
      } else {
        next(err);
      }
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  return User.findOne({ email })
    .then((data) => {
      if (data) {
        throw new ConflictingRequest(duplicateEmailErrorText);
      }
      return bcrypt.hash(password, SALT_ROUNDS)
        .then((hash) => User.create({
          email,
          password: hash,
          name,
        }))
        .then((user) => res.status(201).send({
          email: user.email,
          name: user.name,
          _id: user._id,
        }));
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(incorrectUserDataErrorText);
      } else {
        next(err);
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw next(new UnauthorizedError(incorrectlyDataErrorText));
      }
      return res.cookie(
        'jwt',
        {
          token: jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', {
            expiresIn: '7d',
          }),
        },
        {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        },
      )
        .send({ user: { email, password } });
    })
    .catch(next);
};

const logout = (req, res, next) => res.clearCookie('jwt', {
  httpOnly: true,
  sameSite: true,
})
  .status(201).send({ message: '?????????? ?????????????? ????????????.' })
  .catch(next);

module.exports = {
  getUser,
  createUser,
  updateUser,
  login,
  logout,
};
