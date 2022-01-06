const deleteBtn = document.querySelector('#deleteBtn');
const editBtn = document.querySelector('#editBtn');
const article = document.querySelector('.article');
const goodBtn = document.querySelector('#goodBtn');
const goodNum = document.querySelector('#goodNum');
const badBtn = document.querySelector('#badBtn');
const badNum = document.querySelector('#badNum');
const userData = document.querySelector('#userData');
const commentForm = document.querySelector('#commentForm');
const textArea = commentForm.querySelector('textarea');
const commentBtn = document.querySelector('#commentBtn');
const commentEditBtns = document.querySelector('.commentEditBtns');
const cancelBtn = document.querySelector('#cancelBtn');
const writeCommentBtn = document.querySelector('#writeCommentBtn');
const commentsContainer = document.querySelector('#commentsContainer');
const commentNumberSpan = document.querySelector('#commentNumberSpan');
const articleCommentNumberSpan = document.querySelector(
  '#articleCommentNumberSpan'
);

const isLoggedIn = userData.dataset.loginstate;

let goodState = false;
let badState = false;

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

const handleEdit = (e) => {
  e.preventDefault();
  const currentURL = window.location.href.split('/');
  const postID = currentURL[currentURL.length - 1];
  window.location.replace(`/community/editArticle/${postID}`);
};

const addComment = (e) => {
  commentForm.hidden = false;
  commentEditBtns.hidden = true;
};

const cancelComment = (e) => {
  e.preventDefault();
  commentForm.hidden = true;
  commentEditBtns.hidden = false;
  textArea.value = '';
};

const createComment = (content, time) => {
  const commentDIV = document.createElement('div');
  commentDIV.id = 'commentDIV';
  const commentHeader = document.createElement('div');
  commentHeader.innerHTML = `
  <div>
    <a href=/user/profile/${userData.dataset.owner}>
    <img src=${
      userData.dataset.avatar
        ? userData.dataset.avatar
        : '/public/images/nouser.png'
    }></a>
    <a href=/user/profile/${userData.dataset.owner}><span>${
    userData.dataset.owner
  }</span>
    </a>
    <span id="time">${time}</span>
  </div>
  <div id="commentToolBox">
  <span id="commentEditBtn">✏</span>
  <span id="replyBtn">↩</span>
  <span id="commentDeleteBtn">✖</span>
  </div>
  `;
  commentHeader.id = 'commentHeader';
  const commentBody = document.createElement('div');
  commentBody.id = 'commentBody';
  commentBody.innerHTML = content;
  commentDIV.append(commentHeader, commentBody);
  commentsContainer.prepend(commentDIV);
};

const writeComment = async (e) => {
  if (textArea.value === '') {
    return;
  }
  e.preventDefault();
  try {
    const commentFetch = await fetch(
      `/community/comments/${article.dataset.id}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: textArea.value }),
      }
    );
    if (commentFetch.status === 200) {
      commentForm.hidden = true;
      commentEditBtns.hidden = false;
      const time = createdAt(Math.floor(new Date().getTime() / (1000 * 60)));
      createComment(textArea.value, time);
      textArea.value = '';
      commentNumberSpan.innerHTML = Number(commentNumberSpan.innerHTML) + 1;
      articleCommentNumberSpan.innerHTML =
        Number(articleCommentNumberSpan.innerHTML) + 1;
    }
  } catch (error) {
    console.log(error);
  }
};

const addGood = async (e) => {
  e.preventDefault();
  if (goodState === false && badState === false) {
    goodNum.innerHTML = Number(goodNum.innerHTML) + 1;
    goodState = true;
  } else if (goodState === true && badState === false) {
    goodNum.innerHTML = Number(goodNum.innerHTML) - 1;
    goodState = false;
  }
  try {
    const postID = article.dataset.id;
    const goodFetch = await fetch(`/community/addGood/${postID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goodNum: goodNum.innerHTML, type: 'good' }),
    });
  } catch (error) {
    console.log(error);
  }
};

const addBad = async (e) => {
  e.preventDefault();
  if (badState === false && goodState === false) {
    badNum.innerHTML = Number(badNum.innerHTML) + 1;
    badState = true;
  } else if (badState === true && goodState === false) {
    badNum.innerHTML = Number(badNum.innerHTML) - 1;
    badState = false;
  }
  try {
    const postID = article.dataset.id;
    const badFetch = await fetch(`/community/addGood/${postID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ badNum: badNum.innerHTML, type: 'bad' }),
    });
  } catch (error) {
    console.log(error);
  }
};

if (isLoggedIn) {
  badBtn.addEventListener('click', addBad);
  goodBtn.addEventListener('click', addGood);
  commentBtn.addEventListener('click', addComment);
  cancelBtn.addEventListener('click', cancelComment);
  writeCommentBtn.addEventListener('click', writeComment);
}

if (editBtn) {
  editBtn.addEventListener('click', handleEdit);
}

/* Comment Tool */
const commentEditBtn = document.querySelector('#commentEditBtn');
const replyBtn = document.querySelector('#replyBtn');
const commentDeleteBtns = document.querySelectorAll('#commentDeleteBtn');
let commentID;
let commentDIV;
const askDeletComment = (e) => {
  commentID =
    e.target.parentElement.parentElement.parentElement.dataset.commentid;
  commentDIV = e.target.parentElement.parentElement.parentElement;
  const modalWindow = document.createElement('div');
  modalWindow.id = 'modalWindow';
  modalWindow.className = 'modalWindow';
  modalWindow.innerHTML = `
  <div id="modalInner">
  <h3>Delete Comment</h3>
  <p>Do you want to delete comment?</p>
  <div id="modalBtns">
  <button id="commentCancelBtn">Cansel</button>
  <button id="commentConfirmBtn">Confirm</button>
  </div>
  </div>
  `;

  document.body.style = 'overflow:hidden';
  document.body.append(modalWindow);

  const commentCancelBtn = document.querySelector('#commentCancelBtn');
  const commentConfirmBtn = document.querySelector('#commentConfirmBtn');
  commentCancelBtn.addEventListener('click', (e) => {
    modalWindow.remove();
    document.body.style = 'overflow:auto';
    return;
  });
  commentConfirmBtn.addEventListener('click', (e) => {
    modalWindow.remove();
    document.body.style = 'overflow:auto';
    deleteComment();
  });
};

const deleteComment = async (e) => {
  let articleID = window.location.href.split('/');
  articleID = articleID[articleID.length - 1];
  console.log(articleID);
  try {
    const deleteCommentFetch = await fetch(`/community/comments/${articleID}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentID }),
    });
    if (deleteCommentFetch.status === 200) {
      commentDIV.remove();
      commentNumberSpan.innerHTML = Number(commentNumberSpan.innerHTML) - 1;
      articleCommentNumberSpan.innerHTML =
        Number(articleCommentNumberSpan.innerHTML) - 1;
      commentID = '';
    }
  } catch (error) {
    console.log(error);
  }
};

commentDeleteBtns.forEach((commentDeleteBtn) => {
  commentDeleteBtn.addEventListener('click', askDeletComment);
});

const init = () => {
  commentForm.hidden = true;
};

init();
