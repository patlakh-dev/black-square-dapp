# ⚡ Быстрое исправление: Root Directory в Vercel

## Где найти Root Directory

1. **Откройте Settings** (вкладка вверху проекта)
2. **Нажмите на "Build and Deployment"** (второй пункт в меню слева)
3. **Прокрутите вниз** до секции **"Root Directory"**
4. **Нажмите "Edit"** или "Change"
5. **Введите:** `frontend`
6. **Сохраните**

## После установки Root Directory

Вернитесь на вкладку **Deployments** и измените команды:

1. Нажмите на иконку карандаша (✏️) рядом с командами
2. Измените:
   - **Build Command:** `npm install && npm run build` (уберите `cd frontend &&`)
   - **Output Directory:** `dist` (уберите `frontend/`)
   - **Install Command:** `npm install` (уберите `cd frontend &&`)
3. Сохраните
4. Запустите новый деплой (Redeploy)

## Если не нашли Root Directory

Если в "Build and Deployment" нет поля Root Directory:
- Оставьте его пустым
- Убедитесь, что команды содержат `cd frontend &&` (как сейчас)
- Команды должны быть:
  - Build Command: `cd frontend && npm install && npm run build`
  - Output Directory: `frontend/dist`
  - Install Command: `cd frontend && npm install`

