const prePageBtn = document.querySelector('#prePageBtn');
const nextPageBtn = document.querySelector('#nextPageBtn');

const currentPage = window.location.href.split('/');
const currentPageID = currentPage[currentPage.length - 1];
console.log(currentPageID);

const handlePrePage = async (e) => {
  console.log(e);
  pageID = Number(currentPageID) - 1;
  try {
    const prePageFetch = await fetch(`/community/community/${pageID}`);
    if (prePageFetch.status === 200) {
      window.location.replace(`/community/community/${pageID}`);
    }
  } catch (error) {
    console.log(error);
  }
};

const handleNextPage = async (e) => {
  console.log(e);
  pageID = Number(currentPageID) + 1;
  try {
    const nextPageFetch = await fetch(`/community/community/${pageID}`);
    if (nextPageFetch.status === 200) {
      window.location.replace(`/community/community/${pageID}`);
    }
  } catch (error) {
    console.log(error);
  }
};

prePageBtn.addEventListener('click', handlePrePage);
nextPageBtn.addEventListener('click', handleNextPage);
