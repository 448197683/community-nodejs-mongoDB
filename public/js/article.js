const deleteBtn = document.querySelector('#deleteBtn');
const editBtn = document.querySelector('#editBtn');
const article = document.querySelector('.article');

const handleEdit = (e) => {
  e.preventDefault();
  const currentURL = window.location.href.split('/');
  const postID = currentURL[currentURL.length - 1];
  window.location.replace(`/community/editArticle/${postID}`);
};

editBtn.addEventListener('click', handleEdit);

const handleDelete = async (e) => {
  e.preventDefault();
  const articleID = article.dataset.id;
  try {
    const deleteFetch = await fetch(`/community/article/${articleID}`, {
      method: 'DELETE',
    });
    if (deleteFetch.status === 200) {
      return window.location.replace('/community/community');
    }
  } catch (error) {
    console.log(error);
  }
};

deleteBtn.addEventListener('click', handleDelete);
