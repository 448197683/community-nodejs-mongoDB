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
      good: 0,
      bad: 0,
      views: 0,
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
  console.log(req.params.id);
  try {
    const viewsUpdate = await db.collection('community').updateOne(
      { _id: Number(req.params.id) },
      {
        $inc: {
          views: +1,
        },
      }
    );
    const post = await db
      .collection('community')
      .findOne({ _id: Number(req.params.id) });

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
  try {
    const editArticle = await db.collection('community').updateOne(
      { _id: Number(req.params.id) },
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          createdAt: new Date().getTime(),
        },
      }
    );
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
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

/* Add Good */
export const putAddGoodController = async (req, res) => {
  console.log(req.body.goodNum, req.body.badNum);
  try {
    if (req.body.type === 'good') {
      const addGood = await db.collection('community').updateOne(
        { _id: Number(req.params.id) },
        {
          $set: { good: req.body.goodNum },
        }
      );
    } else {
      const addGood = await db.collection('community').updateOne(
        { _id: Number(req.params.id) },
        {
          $set: { bad: req.body.badNum },
        }
      );
    }

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
};
