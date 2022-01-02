import { db, counter } from '../db.js';

export const communityController = async (req, res) => {
  try {
    const findCommunity = await db.collection('community').find().toArray();
    findCommunity.forEach((article) => {
      const time = createdAt(article.createdAt);
      article.time = time;
    });

    res.status(200).render('community.ejs', { datas: findCommunity });
  } catch (error) {
    console.log(error);
  }
};

export const getWriteAritcleController = (req, res) => {
  res.status(200).render('writeArticle.ejs');
};
export const postWriteAritcleController = async (req, res) => {
  try {
    const saveArticle = await db.collection('community').insertOne({
      title: req.body.title,
      content: req.body.content,
      _id: counter.count + 1,
      owner: req.session.user.nickname,
      createdAt: Math.floor(new Date().getTime() / (1000 * 60)),
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

    const time = createdAt(post.createdAt);
    post.time = time;
    return res.status(200).render('article.ejs', { data: post });
  } catch (error) {
    console.log(error);
  }
};

export const deleteArticlecontroller = async (req, res) => {
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
          createdAt: Math.floor(new Date().getTime() / (1000 * 60)),
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

export const addCommentController = async (req, res) => {
  const articleId = req.params.articleId;
  const content = req.body.comment;
  try {
    const addComment = await db.collection('comments').insertOne({
      content,
      articleId,
      nickname: req.session.user.nickname,
      avatarURL: req.session.user.avatarURL,
      createdAt: Math.floor(new Date().getTime() / (1000 * 60)),
    });
    return res.status(200).end();
  } catch (error) {
    console.log(error);
  }
};

const createdAt = (oldTime) => {
  const currentTime = Math.floor(new Date().getTime() / (1000 * 60));
  const calTime = currentTime - oldTime;
  let resultTime;
  if (calTime < 60) {
    return `${calTime < 2 ? `1 minute ago` : `${calTime} minutes ago`}`;
  } else if (calTime >= 60 && calTime < 60 * 24) {
    resultTime = Math.floor(calTime / 60);
    return `${resultTime < 2 ? `1 hour aog` : `${resultTime}hours ago`}`;
  } else if (calTime >= 60 * 24 && calTime < 60 * 24 * 30) {
    resultTime = Math.floor(calTime / (60 * 24));
    return `${resultTime < 2 ? `1 day ago` : `${resultTime} days ago`}`;
  } else if (calTime >= 60 * 24 * 30 && calTime < 60 * 24 * 30 * 12) {
    resultTime = Math.floor(calTime / (60 * 24 * 30));
    return `${resultTime < 2 ? `1 month ago` : `${resultTime} months ago`}`;
  } else {
    resultTime = Math.floor(calTime / (60 * 24 * 30 * 12));
    return `${resultTime < 2 ? `1 year aog` : `${resultTime} years ago`}`;
  }
};
