const MONGO_URL = 'mongodb://localhost:27017/moviesdb';

const incorrectFilmDataErrorText = 'Переданы некорректные данные при создании фильма.';
const movieNotFoundErrorText = 'Фильм не найден.';
const forbiddenErrorText = 'У вас нет прав на удаление этого фильма.';
const deleteFilmErrorText = 'Фильм удален.';
const userNotFoundErrorText = 'Пользователь не найден.';
const userIdNotFoundErrorText = 'Пользователь с указанным _id не найден.';
const duplicateEmailErrorText = 'Пользователь с таким email уже существует.';
const incorrectUserDataErrorText = 'Переданы некорректные данные при создании пользователя.';
const incorrectlyDataErrorText = 'Неправильная почта или пароль.';
const serverErrorText = 'На сервере произошла ошибка.';
const crashServerErrorText = 'Сервер сейчас упадёт';
const notFoundErrorText = 'Запрашиваемый ресурс не найден.';

module.exports = {
  MONGO_URL,
  incorrectFilmDataErrorText,
  movieNotFoundErrorText,
  forbiddenErrorText,
  deleteFilmErrorText,
  userNotFoundErrorText,
  userIdNotFoundErrorText,
  duplicateEmailErrorText,
  incorrectUserDataErrorText,
  incorrectlyDataErrorText,
  serverErrorText,
  crashServerErrorText,
  notFoundErrorText,
};
