const API_BASE = '/api/movies';

const form = document.getElementById('movie-form');
const list = document.getElementById('movie-list');
const searchInput = document.getElementById('search');

async function loadMovies(search = '') {
  const url = search ? `${API_BASE}?search=${encodeURIComponent(search)}` : API_BASE;
  const res = await fetch(url);
  const movies = await res.json();
  list.innerHTML = movies.map(m => `
    <li>
      <strong>${m.title}</strong> (${m.year}) — ${m.genre}<br>
      Режиссёр: ${m.director}, рейтинг: ${m.rating || '—'}<br>
      ${m.description || ''}
      <button onclick="deleteMovie('${m._id}')">Удалить</button>
    </li>
  `).join('');
}

async function deleteMovie(id) {
  await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  loadMovies();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    title: document.getElementById('title').value,
    genre: document.getElementById('genre').value,
    director: document.getElementById('director').value,
    year: Number(document.getElementById('year').value),
    rating: Number(document.getElementById('rating').value) || 0,
    description: document.getElementById('description').value
  };
  await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  form.reset();
  loadMovies();
});

searchInput.addEventListener('input', (e) => loadMovies(e.target.value));

loadMovies();
