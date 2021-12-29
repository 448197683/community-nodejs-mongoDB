import { db, counter } from '../db.js';

export const communityController = async (req, res) => {
  try {
    const findCommunity = await db.collection('community').find().toArray();

    res.status(200).render('community.ejs', { datas: findCommunity });
  } catch (error) {
    console.log(error);
  }
};

export const getWriteAritcleController = (req, res) => {
  console.log(req.session);
  res.status(200).render('writeArticle.ejs');
};
export const postWriteAritcleController = async (req, res) => {
  console.log(req.body);
  const currentTime = new Date();
  try {
    const saveArticle = await db.collection('community').insertOne({
      title: req.body.title,
      content: req.body.content,
      _id: counter.count + 1,
      owner: req.session.user.nickname,
      createdAt: currentTime.getTime(),
      avatarURL: req.session.user.avatarURL,
    });
    counter.count = counter.count + 1;
    const updateCounter = await db.collection('counter').updateOne(
      { name: 'counter' },
      {
        $set: { count: counter.count },
      }
    );
    res.status(300).redirect(`/community/community`);
  } catch (error) {
    console.log(error);
  }
};

export const getArticleController = async (req, res) => {
  console.log(req.params);
  try {
    const post = await db
      .collection('community')
      .findOne({ _id: Number(req.params.id) });
    console.log(post);
    return res.status(200).render('article.ejs', { data: post });
  } catch (error) {
    console.log(error);
  }
};

export const deleteArticlecontroller = async (req, res) => {
  console.log(req.params);
  try {
    const deleteArticle = await db
      .collection('community')
      .deleteOne({ _id: Number(req.params.id) });
    return res.status(200).end();
  } catch (error) {
    console.log(error);
  }
};

export const putArticleCOntroller = async (req, res) => {
  console.log(req.body);
};

export const getEditArticleController = async (req, res) => {
  try {
    const article = await db
      .collection('community')
      .findOne({ _id: Number(req.params.id) });
    return res.status(200).render('editArticle.ejs', { data: article });
  } catch (error) {
    console.log(error);
  }
};
