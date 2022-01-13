const prePageBtn = document.querySelector('#prePageBtn');
const nextPageBtn = document.querySelector('#nextPageBtn');
const pageNation = document.querySelector('.pageNation');
const pageLIs = document.querySelectorAll('.pageLI');
const sortNewBtn = document.querySelector('#sortNewBtn');

const totalPage = Number(pageNation.dataset.totalpage);

let currentPage;
let newSortState = false;

const pageID = () => {
  currentPage = window.location.href.split('/');
  currentPage = Number(currentPage[currentPage.length - 1]);
  return Number(currentPage);
};

const handlePrePage = async (e) => {
  pageID();
  if (currentPage === 1) {
    return;
  }
  try {
    const prePageFetch = await fetch(`/community/community/${currentPage - 1}`);
    if (prePageFetch.status === 200) {
      window.location.replace(`/community/community/${currentPage - 1}`);
    }
  } catch (error) {
    console.log(error);
  }
};

const handleNextPage = async (e) => {
  pageID();
  if (currentPage === totalPage) {
    return;
  }
  try {
    if (newSortState === false) {
      const nextPageFetch = await fetch(
        `/community/community/${currentPage + 1}`
      );
      if (nextPageFetch.status === 200) {
        window.location.replace(`/community/community/${currentPage + 1}`);
      }
    } else {
      const nextPageFetch = await fetch(
        `/community/newSort/${currentPage + 1}`
      );
      if (nextPageFetch.status === 200) {
        window.location.replace(`/community/newSort/${currentPage + 1}`);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/* ============前端 get请求================== */
const handleSortNew = (e) => {
  newSortState = true;
  const sortNewA = document.querySelector('#sortNewA');
  sortNewA.href = `/community/newSort/1`;
};

prePageBtn.addEventListener('click', handlePrePage);
nextPageBtn.addEventListener('click', handleNextPage);
sortNewBtn.addEventListener('click', handleSortNew);

const init = () => {
  pageID();
  if (currentPage === 1) {
    prePageBtn.style.backgroundColor = 'gray';
    prePageBtn.style.cursor = 'not-allowed';
  } else {
    prePageBtn.style.backgroundColor = 'lightblue';
    prePageBtn.style.cursor = 'pointer';
  }
  if (currentPage === totalPage) {
    nextPageBtn.style.backgroundColor = 'gray';
    nextPageBtn.style.cursor = 'not-allowed';
  } else {
    nextPageBtn.style.backgroundColor = 'lightblue';
    nextPageBtn.style.cursor = 'pointer';
  }
  pageLIs.forEach((li, index) => {
    if (currentPage === index + 1) {
      li.style.backgroundColor = 'red';
    }
  });
};

init();
