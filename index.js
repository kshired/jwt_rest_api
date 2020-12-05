import './env';
import express from 'express';
import passport from 'passport';
import logger from 'morgan';
import cors from 'cors';
import { sequelize } from './models';
import route from './routes';
import passportConfig from './passport';

const app = express();
const PORT = process.env.PORT || 8000;

sequelize.sync();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
passportConfig();

app.use(route);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
