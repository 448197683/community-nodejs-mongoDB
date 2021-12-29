const form = document.querySelector('form');
const titleInput = document.querySelector('input');
const contentInput = document.querySelector('textarea');

const handleEdit = async (e) => {
  e.preventDefault();
  try {
    const title = titleInput.value;
    const content = contentInput.value;
    const postID = form.dataset.id;
    const editFetch = await fetch(`/community/article/${postID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content,
      }),
    });
  } catch (error) {
    console.log(error);
  }
};

form.addEventListener('submit', handleEdit);
