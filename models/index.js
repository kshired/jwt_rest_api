import '../env';
import Sequelize from 'sequelize';
import Config from '../config/config';
import User from './user';
import Post from './post';

const env = process.env.NODE_ENV || 'development';
const config = Config[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = User(sequelize, Sequelize);
db.Post = Post(sequelize, Sequelize);

db.User.hasMany(db.Post);
db.Post.belongsTo(db.User);

module.exports = db;
