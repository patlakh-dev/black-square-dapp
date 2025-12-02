# ✅ Решение для Vercel без Root Directory

## Проблема
Root Directory не видно в настройках Vercel, но команды с `cd frontend &&` не работают.

## Решение: Проверить структуру репозитория

Root Directory может быть недоступен в вашем плане Vercel или в этой версии интерфейса. 

### Вариант 1: Использовать команды как есть (если папка frontend в репозитории)

Если папка `frontend` есть в GitHub репозитории, команды должны работать:

1. Убедитесь, что команды в Vercel правильные:
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Output Directory:** `frontend/dist`
   - **Install Command:** `cd frontend && npm install`

2. Проверьте, что папка `frontend` есть в репозитории:
   - Откройте https://github.com/patlakh-dev/black-square-dapp
   - Убедитесь, что видите папку `frontend`

3. Если папки нет в GitHub - нужно добавить её:
   ```bash
   cd "/Users/daniel/black square"
   git add frontend/
   git commit -m "Add frontend directory"
   git push
   ```

### Вариант 2: Переместить файлы в корень (если Root Directory недоступен)

Если Root Directory недоступен, можно временно переместить файлы frontend в корень:

1. **НЕ РЕКОМЕНДУЕТСЯ** - это изменит структуру проекта
2. Лучше использовать Вариант 1

### Вариант 3: Использовать другой подход

Попробуйте создать новый проект в Vercel:
1. Удалите текущий проект (или создайте новый)
2. При импорте репозитория найдите поле "Root Directory" на странице настройки
3. Установите `frontend` там

## Проверка

После исправления команды должны работать. Если ошибка остается:
- Проверьте логи деплоя в Vercel
- Убедитесь, что папка `frontend` существует в GitHub репозитории
- Попробуйте создать новый проект в Vercel

