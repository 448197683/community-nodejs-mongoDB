const deleteBtn = document.querySelector('#deleteBtn');
const editBtn = document.querySelector('#editBtn');
const article = document.querySelector('.article');
const goodBtn = document.querySelector('#goodBtn');
const goodNum = document.querySelector('#goodNum');
const badBtn = document.querySelector('#badBtn');
const badNum = document.querySelector('#badNum');

let goodState = false;
let badState = false;
let likeState = false;

const handleEdit = (e) => {
  e.preventDefault();
  const currentURL = window.location.href.split('/');
  const postID = currentURL[currentURL.length - 1];
  window.location.replace(`/community/editArticle/${postID}`);
};

const addGood = async (e) => {
  e.preventDefault();
  if (goodState === false) {
    goodNum.innerHTML = Number(goodNum.innerHTML) + 1;
  } else {
    goodNum.innerHTML = Number(goodNum.innerHTML) - 1;
  }
  goodState = !goodState;

  try {
    const postID = article.dataset.id;
    const goodFetch = await fetch(`/community/addGood/${postID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goodNum: goodNum.innerHTML }),
    });
  } catch (error) {
    console.log(error);
  }
};

const addBad = (e) => {
  e.preventDefault();
  if (badState === false) {
    badNum.innerHTML = Number(badNum.innerHTML) + 1;
  } else {
    badNum.innerHTML = Number(badNum.innerHTML) - 1;
  }
  badState = !badState;
};

badBtn.addEventListener('click', addBad);
goodBtn.addEventListener('click', addGood);
editBtn.addEventListener('click', handleEdit);
