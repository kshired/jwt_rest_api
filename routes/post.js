import { Router } from 'express';
import { authenticateJWT } from '../passport';
import { User, Post } from '../models';
const router = Router();

router.get('/posts', (req, res) => {
  Post.findAll({
    include: [
      {
        model: User,
        attributes: ['nick'],
      },
    ],
    order: [['createdAt', 'DESC']],
  }).then((posts) => {
    let result = [];
    for (let {
      id,
      title,
      user: { nick: nick },
    } of posts) {
      result.push({ id, title, nick });
    }
    return res.status(200).json(result);
  });
});

router.post('/posts', authenticateJWT, async (req, res) => {
  try {
    console.log(req.user);
    const post = await Post.create({
      title: req.body.title,
      category: req.body.category,
      content: req.body.content,
      userId: req.user.id,
    });
    return res.status(200).send();
  } catch (err) {
    return res.status(500).send();
  }
});

router.put('/post/:id', authenticateJWT, async (req, res) => {
  let query = {};
  if (req.body.title) query.title = req.body.title;
  if (req.body.category) query.category = req.body.category;
  if (req.body.content) query.contetnt = req.body.content;

  const post = await Post.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });

  if (post) {
    Post.update(query, { where: { id: req.params.id } })
      .then(() => {
        return res.status(200).send();
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).send();
      });
  } else {
    return res.status(500).json({ post: 'cannot find!' });
  }
});

router.delete('/post/:id', authenticateJWT, async (req, res) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (post) {
      Post.destroy({ where: { id: req.params.id } })
        .then(() => {
          return res.status(200).send();
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).send();
        });
    } else {
      return res.status(500).send();
    }
  }
});

router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findOne({
      include: [
        {
          model: User,
          attributes: ['nick'],
        },
      ],
      where: { id: req.params.id },
    });
    return res.status(200).json({
      id: post.id,
      title: post.title,
      category: post.category,
      content: post.content,
      nick: post.user.nick,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
  return res.status(500).send();
});

export default router;
