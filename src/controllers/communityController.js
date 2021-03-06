import { db, counter } from '../db.js';
import { ConnectionCheckOutStartedEvent, ObjectId } from 'mongodb';

export const communityController = async (req, res) => {
  const page = req.params.page;
  try {
    const community = await db.collection('community').find().toArray();
    const findCommunity = await db
      .collection('community')
      .find()
      .limit(5)
      .skip(5 * (Number(page) - 1))
      .sort({ _id: -1 })
      .toArray();
    findCommunity.forEach((article) => {
      const time = createdAt(article.createdAt);
      article.time = time;
    });
    const totalPage = Math.ceil(community.length / 5);
    res
      .status(200)
      .render('community.ejs', { datas: findCommunity, totalPage });
  } catch (error) {
    console.log(error);
  }
};

export const searchController = async (req, res) => {
  const query = req.query.search;
  try {
    const results = await db
      .collection('community')
      .find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { owner: { $regex: query, $options: 'i' } },
        ],
      })
      .toArray();
    results.forEach((article) => {
      const time = createdAt(article.createdAt);
      article.time = time;
    });
    res.status(200).render('serach.ejs', {
      datas: results,
    });
    console.log(results);
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
      nestNumbers: 0,
    });
    counter.count = counter.count + 1;
    const updateCounter = await db.collection('counter').updateOne(
      { name: 'counter' },
      {
        $set: { count: counter.count },
      }
    );
    res.status(300).redirect(`/community/community/1`);
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
    const comments = await db
      .collection('comments')
      .find({ articleId: String(req.params.id) })
      .sort({ _id: -1 })
      .toArray();

    let nestCommentsNum = 0;
    comments.forEach((comment) => {
      comment.createdAt = createdAt(comment.createdAt);
      if (comment.nestComments) {
        nestCommentsNum = nestCommentsNum + comment.nestComments.length;
        comment.nestComments.forEach((nest) => {
          nest.createdAt = createdAt(nest.createdAt);
        });
      }
    });
    const totalCommentNumber = comments.length + nestCommentsNum;
    return res
      .status(200)
      .render('article.ejs', { data: post, comments, totalCommentNumber });
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
  const articleId = req.params.articleID;
  const content = req.body.comment;
  try {
    const addComment = await db.collection('comments').insertOne({
      content,
      articleId,
      nickname: req.session.user.nickname,
      avatarURL: req.session.user.avatarURL,
      createdAt: Math.floor(new Date().getTime() / (1000 * 60)),
    });
    const newCommentID = addComment.insertedId;
    const updateArticle = await db
      .collection('community')
      .updateOne(
        { _id: Number(articleId) },
        { $addToSet: { comments: addComment.insertedId } }
      );
    return res.status(200).end(JSON.stringify({ newCommentID }));
  } catch (error) {
    console.log(error);
  }
};

export const deleteCommentController = async (req, res) => {
  const commentID = new ObjectId(req.body.commentID);

  try {
    const deleteCommentInArticle = await db.collection('community').updateOne(
      { _id: Number(req.params.articleID) },
      {
        $pull: { comments: commentID },
      }
    );

    /* const comment = await db.collection('comments').findOne({ _id: commentID });
    if (comment.nestComments) {
      comment.nestComments.forEach(async (nest) => {
        await db.collection('nestcomments').deleteOne({ _id: nest.nestid });
      });
    } */
    /* =============  DELETE MANY ============ */
    const deleteNest = await db
      .collection('nestcomments')
      .deleteMany({ commentID: req.body.commentID });

    const deleteComment = await db
      .collection('comments')
      .deleteOne({ _id: commentID });

    return res.status(200).end();
  } catch (error) {
    console.log(error);
  }
};

export const putCommentController = async (req, res) => {
  try {
    const editComment = await db.collection('comments').updateOne(
      { _id: new ObjectId(req.params.commentID) },
      {
        $set: { content: req.body.content },
      }
    );
    return res.status(200).end();
  } catch (error) {
    console.log(error);
  }
};

export const postnestCommentController = async (req, res) => {
  try {
    const saveNestComment = await db.collection('nestcomments').insertOne({
      content: req.body.content,
      owner: req.session.user.nickname,
      createdAt: Math.floor(new Date().getTime() / (1000 * 60)),
      commentID: req.params.commentID,
      articleID: req.body.articleID,
    });
    const nestToComment = await db.collection('comments').updateOne(
      { _id: new ObjectId(req.params.commentID) },
      {
        $push: {
          nestComments: {
            $each: [
              {
                nestid: saveNestComment.insertedId,
                content: req.body.content,
                owner: req.session.user.nickname,
                createdAt: Math.floor(new Date().getTime() / (1000 * 60)),
                commentID: req.params.commentID,
                articleID: req.body.articleID,
                avatarURL: req.session.user.avatarURL,
              },
            ],
            $sort: { nestid: -1 },
          },
        },
      }
    );
    const nestNumbers = await db.collection('community').updateOne(
      { _id: Number(req.body.articleID) },
      {
        $inc: {
          nestNumbers: +1,
        },
      }
    );
    return res.status(200).end(
      JSON.stringify({
        nestCommentID: saveNestComment.insertedId,
      })
    );
  } catch (error) {
    console.log(error);
  }
};

export const deleteNestCommentController = async (req, res) => {
  const articleID = req.params.articleID;
  const { commentID, nestID } = req.body;
  try {
    const updateComment = await db.collection('comments').updateOne(
      { _id: new ObjectId(commentID) },
      {
        $pull: {
          nestComments: { nestid: new ObjectId(nestID) },
        },
      }
    );
    const deleteNest = await db
      .collection('nestcomments')
      .deleteOne({ _id: new ObjectId(nestID) });
    const nestNumbers = await db.collection('community').updateOne(
      { _id: Number(req.params.articleID) },
      {
        $inc: {
          nestNumbers: -1,
        },
      }
    );
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
    return `${resultTime < 2 ? `1 hour ago` : `${resultTime}hours ago`}`;
  } else if (calTime >= 60 * 24 && calTime < 60 * 24 * 30) {
    resultTime = Math.floor(calTime / (60 * 24));
    return `${resultTime < 2 ? `1 day ago` : `${resultTime} days ago`}`;
  } else if (calTime >= 60 * 24 * 30 && calTime < 60 * 24 * 30 * 12) {
    resultTime = Math.floor(calTime / (60 * 24 * 30));
    return `${resultTime < 2 ? `1 month ago` : `${resultTime} months ago`}`;
  } else {
    resultTime = Math.floor(calTime / (60 * 24 * 30 * 12));
    return `${resultTime < 2 ? `1 year ago` : `${resultTime} years ago`}`;
  }
};
