#!/bin/bash
set -e

echo "=================================================="
echo "🚀 1-CLICK NEXT.JS CPANEL DEPLOYMENT"
echo "=================================================="

# Move to script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "🔨 Step 1/4: Building Next.js application (standalone)..."
npm run build

echo "📦 Step 2/4: Packaging static assets into standalone..."
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
cp package.json .next/standalone/package.json

echo "🤐 Step 3/4: Compressing deploy.zip..."
cd .next
zip -q -r ../deploy.zip standalone/
cd ..

echo "📤 Step 4/4: Uploading deploy.zip to cPanel server..."
if [ -z "$FTP_PASS" ]; then
    read -s -p "Enter FTP password for megadm@megadm.chat: " FTP_PASS
    echo ""
fi

curl --progress-bar -T deploy.zip --user "megadm@megadm.chat:$FTP_PASS" ftp://162.213.255.40/botchat_next_deploy/deploy.zip

echo "⚡ Triggering extract_deploy.php on server..."
RESPONSE=$(curl -s "https://megadm.chat/extract_deploy.php?secret=divyang123")

echo ""
echo "Server Response: $RESPONSE"
echo "=================================================="
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo "=================================================="
