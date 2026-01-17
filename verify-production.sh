#!/bin/bash

echo "��� AskMeAnon Production Verification"
echo "===================================="
echo ""

# Check Node.js
echo "✓ Node.js version:"
node -v

# Check npm
echo "✓ npm version:"
npm -v

# Check dependencies
echo ""
echo "✓ Installed dependencies:"
npm list --depth=0 | tail -n 6

# Check essential files
echo ""
echo "✓ Essential files:"
files=(
  "index.html"
  "app.js"
  "styles.css"
  "server.js"
  "models.js"
  "api-config.js"
  "utils.js"
  "package.json"
  ".env"
  "README.md"
  "DEPLOYMENT.md"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    size=$(wc -c < "$file" | awk '{printf "%.1f KB", $1/1024}')
    echo "  ✓ $file ($size)"
  else
    echo "  ✗ $file (MISSING)"
  fi
done

echo ""
echo "✓ Project structure looks good!"
echo ""
echo "Next steps:"
echo "1. Configure .env with MongoDB URI"
echo "2. Run: npm run dev (for development)"
echo "3. Run: npm start (for production)"
echo "4. Visit: http://localhost:5000"
echo ""
echo "For deployment, see DEPLOYMENT.md"
