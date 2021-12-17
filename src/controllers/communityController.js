import { db, counter } from '../db.js';

export const communityController = async (req, res) => {
  try {
    const findCommunity = await db.collection('community').find().toArray();

    res.status(200).render('community.ejs', { datas: findCommunity });
  } catch (error) {
    console.log(error);
  }
};

export const getAritcleController = (req, res) => {
  console.log(req.session);
  res.status(200).render('writeArticle.ejs');
};
export const postAritcleController = async (req, res) => {
  console.log(req.body);
  try {
    const saveArticle = await db.collection('community').insertOne({
      title: req.body.title,
      content: req.body.content,
      _id: counter.count + 1,
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
