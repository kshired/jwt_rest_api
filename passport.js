import './env';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from './models';

const LocalStrategyOption = {
  usernameField: 'email',
  passwordField: 'password',
};

const localVerify = async (email, password, done) => {
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      const result = await bcrypt.compare(password, exUser.password);
      if (result) {
        return done(null, exUser);
      } else {
        return done(null, false);
      }
    } else {
      return done(null, false);
    }
  } catch (err) {
    return done(err, false);
  }
};

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET,
};

const jwtVerify = async (payload, done) => {
  try {
    const exUser = await User.findOne({ where: { id: payload.id } });
    const userData = {
      id: exUser.id,
      nick: exUser.nick,
    };
    if (exUser) {
      return done(null, userData);
    } else {
      return done(null, false);
    }
  } catch (err) {
    return done(err, false);
  }
};

export default function passportConfig() {
  passport.use(new LocalStrategy(LocalStrategyOption, localVerify));
  passport.use(new JwtStrategy(jwtOptions, jwtVerify));
}

export function authenticateJWT(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    req.user = user;
    next();
  })(req, res, next);
}
