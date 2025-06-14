#!/bin/bash

# Define directories
dirs=(
  "frontend/public"
  "frontend/src/api"
  "frontend/src/components/Auth"
  "frontend/src/components/Chat"
  "frontend/src/components/Layout"
  "frontend/src/components/UI"
  "frontend/src/contexts"
  "frontend/src/hooks"
  "frontend/src/pages"
  "frontend/src/styles/components"
  "frontend/src/utils"
)

# Define files
files=(
  "frontend/public/favicon.ico"
  "frontend/public/index.html"
  "frontend/public/logo192.png"
  "frontend/public/logo512.png"
  "frontend/public/manifest.json"
  "frontend/public/robots.txt"

  "frontend/src/api/auth.js"
  "frontend/src/api/chat.js"
  "frontend/src/api/websocket.js"

  "frontend/src/components/Auth/LoginForm.jsx"
  "frontend/src/components/Auth/RegisterForm.jsx"
  "frontend/src/components/Chat/ChatBubble.jsx"
  "frontend/src/components/Chat/ChatHistory.jsx"
  "frontend/src/components/Chat/ChatInput.jsx"
  "frontend/src/components/Chat/ChatWindow.jsx"
  "frontend/src/components/Layout/Header.jsx"
  "frontend/src/components/Layout/Sidebar.jsx"
  "frontend/src/components/UI/Button.jsx"
  "frontend/src/components/UI/Input.jsx"
  "frontend/src/components/UI/Loader.jsx"

  "frontend/src/contexts/AuthContext.jsx"
  "frontend/src/contexts/ChatContext.jsx"

  "frontend/src/hooks/useAuth.js"
  "frontend/src/hooks/useChat.js"
  "frontend/src/hooks/useWebSocket.js"

  "frontend/src/pages/ChatPage.jsx"
  "frontend/src/pages/HomePage.jsx"
  "frontend/src/pages/LoginPage.jsx"
  "frontend/src/pages/NotFoundPage.jsx"
  "frontend/src/pages/RegisterPage.jsx"

  "frontend/src/styles/components/auth.css"
  "frontend/src/styles/components/chat.css"
  "frontend/src/styles/components/layout.css"
  "frontend/src/styles/global.css"

  "frontend/src/utils/api.js"
  "frontend/src/utils/auth.js"
  "frontend/src/utils/formatters.js"
  "frontend/src/utils/validators.js"

  "frontend/src/App.jsx"
  "frontend/src/App.css"
  "frontend/src/index.js"
  "frontend/src/index.css"

  "frontend/.env.development"
  "frontend/.env.production"
  "frontend/.eslintrc.js"
  "frontend/.gitignore"
  "frontend/.prettierrc"
  "frontend/Dockerfile"
  "frontend/jsconfig.json"
  "frontend/package.json"
  "frontend/README.md"
)

# Create directories
echo "Creating frontend directories..."
for dir in "${dirs[@]}"; do
  mkdir -p "$dir"
done

# Create files
echo "Creating frontend files..."
for file in "${files[@]}"; do
  touch "$file"
done

echo "Frontend structure created successfully!"
