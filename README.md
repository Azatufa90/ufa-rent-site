# Аренда квартир в городе Уфа (Next.js + Supabase) — полный проект

Это **полный набор файлов** (без node_modules), который можно положить поверх проекта Next.js.

## Что умеет
- Главная: карточки-разделы по типам (Комнаты/Студии/1шки/2шки/3шки/4–5)
- Каталог: фильтры (поиск, район, тип, цена)
- Виджет «Свежие объекты» в углу + страница `/fresh` (обновление 1 раз в сутки)
- Страница объекта `/listing/[id]`: галерея фото + видео
- Авторизация email/password (Supabase Auth)
- Кабинет `/dashboard`: добавить/редактировать/удалять свои объявления, загрузка фото/видео в Storage (drag&drop), карта
- Админка `/admin`: список всех объявлений + модерация статуса draft/active/archived + удаление

Контакты в шапке/подвале:
- 89613719141
- https://t.me/kvartirkaufa02
- MAX (значок)

---

## Установка для новичка (самый простой путь)

### 1) Создай проект Next.js
```bash
npx create-next-app@latest ufa-rent
cd ufa-rent
```

Выбери:
- TypeScript: Yes
- App Router: Yes
- ESLint: Yes
- Tailwind: No (не нужно)

### 2) Установи зависимости
```bash
npm i @supabase/supabase-js @supabase/ssr leaflet react-leaflet
```

### 3) Скопируй файлы из архива
Распакуй этот архив и **скопируй его содержимое в папку проекта** `ufa-rent/` с заменой файлов.

### 4) Настрой Supabase
1) Создай проект Supabase
2) Storage → New bucket: `listing-photos` → **Public ON**
3) SQL Editor → Run:
   - `supabase/sql/001_schema.sql`
   - `supabase/sql/002_storage_policies.sql`

### 5) Добавь `.env.local`
Создай файл `.env.local` в корне проекта:
```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### 6) Запусти сайт локально
```bash
npm run dev
```
Открой: http://localhost:3000

---

## Как стать админом
1) Зарегистрируйся на /login
2) В Supabase → Table Editor → `profiles`
3) Найди строку своего пользователя и поставь `role = 'admin'`

---

## Деплой (самое простое — Vercel)
1) Залей проект на GitHub (или просто импортируй папку в Vercel)
2) Vercel → New Project → Import
3) В Vercel → Project → Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4) Deploy

## Домен
1) Купи домен (Reg.ru, Namecheap и т.д.)
2) Vercel → Project → Settings → Domains → Add domain
3) В панели домена добавь DNS записи, которые покажет Vercel (обычно A и CNAME)
4) Подожди обновление DNS (от минут до нескольких часов)

---

Если что-то не запускается — пришли скрин ошибки, помогу.
