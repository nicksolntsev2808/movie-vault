# movie-vault

Каталог фильмов с REST API (CRUD) на бэкенде (Node.js/Express/Mongoose) и статическим фронтендом (HTML/CSS/JS, без сборки).

### Структура
```
├── backend/   # Express + Mongoose, слушает порт из .env (по умолчанию 7000)
├── frontend/  # статические файлы: index.html, style.css, app.js
```

Фронтенд обращается к API по **относительному** пути `/api/movies` (без хоста/порта) — это сделано специально для задачи ниже.

## Функции API
- CRUD для фильмов (`title`, `genre`, `director`, `year`, `rating`, `description`)
- Поиск по названию/режиссёру/описанию: `GET /api/movies?search=...`
- Фильтр по жанру: `GET /api/movies?genre=...`
- `GET /api/health` — health-check эндпоинт

## Примеры запросов
```bash
curl -X POST -H 'Content-Type: application/json' http://localhost:7000/api/movies \
-d '{
  "title": "Интерстеллар",
  "genre": "Фантастика",
  "director": "Кристофер Нолан",
  "year": 2014,
  "rating": 9,
  "description": "Путешествие сквозь червоточину"
}'

curl -X GET http://localhost:7000/api/movies
curl -X GET "http://localhost:7000/api/movies?genre=Фантастика"
```

---

## Задача: настроить Nginx перед приложением

Приложение запущено (backend через systemd/venv-аналог на Node, frontend — просто статические файлы), но напрямую пользователи к нему не должны обращаться. Нужно поставить **Nginx** перед приложением и настроить его так, чтобы:

1. Nginx отдавал статические файлы фронтенда (`index.html`, `style.css`, `app.js`) напрямую, без обращения к Node.
2. Все запросы на `/api/` Nginx проксировал на backend (`http://localhost:7000`), сохраняя путь как есть.
3. Для статических файлов (`.css`, `.js`) было включено **gzip-сжатие**.
4. Для статических файлов были выставлены заголовки **кэширования** (`Cache-Control`/`Expires`) на разумный срок.
5. При обращении к несуществующей странице отдавалась **кастомная страница 404** (не стандартная nginx-заглушка).
6. **Со звёздочкой**: запусти backend в двух экземплярах на разных портах (например, `7000` и `7001`) и настрой в Nginx `upstream`-блок с балансировкой нагрузки между ними (round-robin).
7. **Со звёздочкой**: ограничь частоту запросов к `/api/` с помощью `limit_req`, чтобы защититься от чрезмерной нагрузки.

Проверка (должно работать одинаково что напрямую к бэкенду, что через Nginx):
```bash
# через Nginx (порт 80)
curl http://localhost/
curl http://localhost/api/movies
curl -I http://localhost/style.css   # проверить заголовки кэширования и gzip
curl http://localhost/no-such-page   # проверить кастомную 404
```
