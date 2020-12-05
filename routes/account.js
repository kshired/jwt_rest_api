import '../env';
import passport from 'passport';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Router } from 'express';

import { User, Post } from '../models';
import { authenticateJWT } from '../passport';

const router = Router();

router.get('/check-duplicate/email/:email', async (req, res) => {
  const exUser = await User.findOne({ where: { email: req.params.email } });
  if (exUser) {
    return res.status(409).send({
      email: 'is conflicted!',
    });
  } else {
    return res.status(200).send();
  }
});

router.get('/check-duplicate/nickname/:nickname', async (req, res) => {
  const exUser = await User.findOne({ where: { nick: req.params.nickname } });
  if (exUser) {
    return res.status(409).send({
      nickname: 'is conflicted!',
    });
  } else {
    return res.status(200).send();
  }
});

router.post('/signup', async (req, res) => {
  const { email, nick, password } = req.body;

  const exUser = await User.findOne({ where: { email } });
  if (exUser) {
    return res.status(409).send({
      email: 'is conflicted!',
    });
  }
  const hash = await bcrypt.hash(password, 12);
  User.create({
    email,
    nick,
    password: hash,
  })
    .then(() => {
      return res.status(200).send();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send();
    });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        message: 'Something is not right',
        user: user,
      });
    }
    req.login(user, { session: false }, (error) => {
      if (error) {
        res.send(error);
      }
      const token = jwt.sign(
        {
          id: user.id,
          nick: user.nick,
        },
        process.env.SECRET
      );
      return res.status(200).json({ token });
    });
  })(req, res);
});

router.get('/posts', authenticateJWT, (req, res) => {
  Post.findAll({
    include: [
      {
        model: User,
        attributes: ['nick'],
      },
    ],
    where: { userId: req.user.id },
  }).then((posts) => {
    let result = [];
    for (let {
      id,
      title,
      content,
      userId,
      user: { nick: nick },
    } of posts) {
      result.push({ id, title, nick });
    }
    return res.status(200).json(result);
  });
});

export default router;
