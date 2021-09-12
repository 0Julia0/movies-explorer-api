require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const usersRouter = require('./routes/users');
const moviesRouter = require('./routes/movies');
const appRouter = require('./routes/index');
const auth = require('./middlewares/auth');
const limiter = require('./middlewares/rate-limiter');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/notFoundError');
const {
  MONGO_URL, serverErrorText, crashServerErrorText, notFoundErrorText,
} = require('./utils/constants');

const { NODE_ENV, DATA_BASE, PORT = 3000 } = process.env;

const app = express();
const corsOptions = {
  origin: ['https://movies-explorer-julia.nomoredomains.club',
    'http://movies-explorer-julia.nomoredomains.club',
    'localhost:3000',
    'http://192.168.1.177:3000',
    'http://localhost:3000',
  ],
  credentials: true,
};

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(NODE_ENV === 'production' ? DATA_BASE : MONGO_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(cookieParser());

app.use(requestLogger);

app.use(cors(corsOptions));

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error(crashServerErrorText);
  }, 0);
});

app.use(limiter);

app.use('/', appRouter);

app.use(auth);

app.use('/', usersRouter);
app.use('/', moviesRouter);
app.use('/*', () => {
  throw new NotFoundError(notFoundErrorText);
});

app.use(errorLogger);
app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? serverErrorText
        : message,
    });
  next();
});

app.listen(PORT);
