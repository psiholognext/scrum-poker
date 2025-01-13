Устанавливате Next.js
bash npm install --force  

Затем удалите node_modules и package-lock.json
bash npm install

Создайте сборку проекта: Выполните команду для создания продакшен-сборки:
bash npm run build

Запустите приложение снова: После успешной сборки выполните:
bash  npm start

Если вы просто хотите запустить приложение в режиме разработки (без сборки), используйте:
bash npm run dev

открывате смотрите Local:        http://localhost:3000
с остальным поможет любой GPT

смена языка lib/contexts/language-context.tsx       // Default to Russian language   const [language, setLanguage] = useState<Language>('ru') 
  // Default to English language     const [language, setLanguage] = useState<Language>('en')

![image](https://github.com/user-attachments/assets/1776b4af-bf46-490d-84f4-54a5d15f6e02)
![image](https://github.com/user-attachments/assets/eac55bec-b9bf-4654-87ab-71e2031e4a8b)
