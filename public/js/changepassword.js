const form = document.querySelector('form');
console.log(form);

const handleSubmit = async (e) => {
  e.preventDefault();
  const passwordFetch = await fetch('/user/changePassword', {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ text: 'HELLO' }),
  });
};

form.addEventListener('submit', handleSubmit);
