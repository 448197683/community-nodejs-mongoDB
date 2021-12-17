import { db } from '../db.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import fetch from 'cross-fetch';
import { restart } from 'nodemon';

export const getJoinController = (req, res) => {
  return res.status(200).render('join.ejs');
};

const deleteAvatar = (fileURL) => {
  if (fs.existsSync(fileURL)) {
    fs.unlinkSync(fileURL);
  } else {
    return;
  }
};

export const postJoinController = async (req, res) => {
  const { email, nickname, password, password2, gender, avatar, birth } =
    req.body;
  let fileURL = '';
  if (req.file) {
    fileURL = path.resolve(__dirname, '..', '..', `${req.file.path}`);
  }
  if (password !== password2) {
    if (!fileURL) {
      deleteAvatar(fileURL);
    }

    return res.status(400).render('join.ejs', { message: 'PASSWORD ERROR' });
  }

  const user = await db.collection('users').findOne({ email });
  if (user) {
    if (!fileURL) {
      deleteAvatar(fileURL);
    }
    return res
      .status(400)
      .render('join.ejs', { message: `EMAIL ${email} ALREADY EXISTS` });
  }

  const nicknameCheck = await db.collection('users').findOne({ nickname });
  if (nicknameCheck) {
    if (!fileURL) {
      deleteAvatar(fileURL);
    }
    return res
      .status(400)
      .render('join.ejs', { message: `NICKNAME ${nickname}  ALREADY EXISTS` });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 5);
    let avatarURL = '';
    if (req.file) {
      avatarURL = '/' + req.file.path;
    }
    const createUser = await db.collection('users').insertOne({
      email,
      nickname,
      password: hashedPassword,
      gender,
      avatarURL,
      birth,
      socialOnly: false,
    });
    return res.status(300).redirect('/user/login');
  } catch (error) {
    console.log(error);
  }
};

export const getLoginController = (req, res) => {
  return res.status(200).render('login.ejs');
};

export const postLoginController = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res
        .status(400)
        .render('login.ejs', { error: "Email doesn't exist" });
    }

    if (user.socialOnly === true) {
      return res.status(400).render('login.ejs', {
        error: `You already have a ${user.oAuth} Account`,
      });
    }
    const checkPassword = bcrypt.compareSync(password, user.password);
    if (checkPassword === true) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      return res.status(200).redirect('/');
    } else {
      return res.status(400).render('login.ejs', { error: 'Password Error' });
    }
  } catch (error) {
    console.log(error);
  }
};

export const getLogoutController = (req, res) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  return res.status(200).redirect('/');
};

/* =======================GITHUB LOGIN====================== */

export const gihubStartController = (req, res) => {
  const baseURL = `https://github.com/login/oauth/authorize?`;
  const config = {
    client_id: process.env.GITHUB_ID,
    scope: 'read:user user:email',
  };
  const query = new URLSearchParams(config).toString();
  const finalURL = baseURL + query;
  res.redirect(finalURL);
};

export const githubFinishController = async (req, res) => {
  const code = req.query.code;
  const baseURL = `https://github.com/login/oauth/access_token?`;
  const config = {
    client_id: process.env.GITHUB_ID,
    client_secret: process.env.GITHUB_SECRET,
    code,
  };
  const query = new URLSearchParams(config).toString();
  const finalURL = baseURL + query;
  try {
    const tokenFetch = await fetch(finalURL, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    });
    const tokenJSON = await tokenFetch.json();
    const token = tokenJSON.access_token;
    if (tokenJSON) {
      const userFetch = await fetch(`https://api.github.com/user`, {
        method: 'GET',
        headers: {
          Authorization: `token ${token}`,
        },
      });
      const userJSON = await userFetch.json();
      const emailFetch = await fetch('https://api.github.com/user/emails', {
        method: 'get',
        headers: {
          Authorization: `token ${token}`,
        },
      });
      const emailJSON = await emailFetch.json();
      const email = emailJSON.find((item) => {
        return item.primary === true && item.verified === true;
      }).email;
      const localUser = await db.collection('users').findOne({ email });
      if (localUser) {
        if (!localUser.avatar) {
          const updateAvatar = await db.collection('users').updateOne(
            { email },
            {
              $set: { avatarURL: userJSON.avatar_url },
            }
          );
        }
        req.session.isLoggedIn = true;
        req.session.user = localUser;
        return res.status(300).redirect('/');
      } else {
        try {
          const addUser = await db.collection('users').insertOne({
            email,
            nickname: userJSON.company ? userJSON.name : email.split('@')[0],
            password: '',
            gender: '',
            avatarURL: userJSON.avatar_url,
            birth: '',
            socialOnly: true,
            oAuth: 'Github',
          });
          const user = await db.collection('users').findOne({ email });
          req.session.isLoggedIn = true;
          req.session.user = user;
          return res.status(300).redirect('/');
        } catch (error) {
          console.log(error);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/* ====================GOOGLE LOGIN============== */
export const googleStartController = (req, res) => {
  const baseURL = `https://accounts.google.com/o/oauth2/v2/auth?`;
  const config = {
    client_id: process.env.GOOGLE_ID,
    redirect_uri: `http://localhost:8080/user/google/callback`,
    response_type: 'code',
    scope: `openid email profile`,
  };
  const query = new URLSearchParams(config).toString();
  const finalURL = baseURL + query;
  res.redirect(finalURL);
};

export const googleFinishController = async (req, res) => {
  const code = req.query.code;
  const baseURL = `https://oauth2.googleapis.com/token?`;
  const config = {
    client_id: process.env.GOOGLE_ID,
    client_secret: process.env.GOOGLE_SECRET,
    code,
    redirect_uri: `http://localhost:8080/user/google/callback`,
    grant_type: 'authorization_code',
  };
  const query = new URLSearchParams(config).toString();
  const finalURL = baseURL + query;
  try {
    const requestToken = await fetch(finalURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const tokenJSON = await requestToken.json();
    if (tokenJSON) {
      const requsetUser = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${tokenJSON.access_token}`,
          },
        }
      );
      const userJSON = await requsetUser.json();
      try {
        const localUser = await db
          .collection('users')
          .findOne({ email: userJSON.email });
        if (localUser) {
          req.session.isLoggedIn = true;
          req.session.user = localUser;
          return res.status(300).redirect('/');
        } else {
          const addUser = await db.collection('users').insertOne({
            email: userJSON.email,
            nickname: userJSON.name,
            password: '',
            gender: '',
            avatarURL: userJSON.picture,
            birth: '',
            socialOnly: true,
            oAuth: 'Google',
          });
          req.session.isLoggedIn = true;
          req.session.user = await db
            .collection('users')
            .findOne({ email: userJSON.email });
        }
        return res.status(300).redirect('/');
      } catch (error) {
        console.log(error);
      }
    } else {
      /* tokenJSON bu zai */
    }
  } catch (error) {
    console.log(error);
  }
};

/* USER PROFILE */
export const getProfileController = (req, res) => {
  return res.status(200).render('profile.ejs');
};

/* EDIT USER PROFILE */
export const getEditProfileController = (req, res) => {
  return res.status(200).render('editProfile.ejs');
};

export const postEditProfileController = async (req, res) => {
  const { email, nickname, gender, birth } = req.body;
  if (
    email === req.session.user.email &&
    nickname === req.session.user.nickname
  ) {
    try {
      const updateProfile = await db.collection('users').updateOne(
        { email: req.session.user.email },
        {
          $set: { email: email, nickname: nickname, gender, birth },
        }
      );
      req.session.user = await db.collection('users').findOne({ email });
      return res.status(300).redirect('/user/profile');
    } catch (error) {
      console.log(error);
    }
  }

  try {
    const checkEmail = await db.collection('users').findOne({ email });
    if (checkEmail) {
      return res.status(400).render('editProfile.ejs', {
        message: `EAMIL ${email} ALREADY EXISTS`,
      });
    }
    const checkNickname = await db.collection('users').findOne({ nickname });
    if (checkNickname) {
      return res.status(400).render('editProfile.ejs', {
        message: `NICKNAME ${nickname} ALREADY EXISTS`,
      });
    }
  } catch (error) {
    console.log(error);
  }
};
