#!/bin/bash

# Load configuration from .env if present
if [ -f "$(dirname "$0")/.env" ]; then
    export $(grep -v '^#' "$(dirname "$0")/.env" | xargs)
fi

export PATH="/opt/homebrew/bin:$PATH"

# Paths are now relative to this script inside the repository
SERVER_PATH="$(dirname "$0")/dist/index.js"
APP_NAME="siyuan-mcp"
SIYUAN_URL="http://${SIYUAN_HOST:-127.0.0.1}:${SIYUAN_PORT:-6806}"

# Ensure pm2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing pm2..."
    npm install -g pm2
fi

check_siyuan_connection() {
    echo "Checking connection to SiYuan at $SIYUAN_URL..."
    
    if [ -z "$SIYUAN_TOKEN" ]; then
        echo "⚠️ WARNING: SIYUAN_TOKEN is not set. MCP calls requiring auth will fail."
        echo "   Please create a .env file with SIYUAN_TOKEN=your_token."
    fi

    local response=$(curl -s -w "\n%{http_code}" -X POST -H "Authorization: Token $SIYUAN_TOKEN" "$SIYUAN_URL/api/system/version" 2>/dev/null)
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')

    if [ "$http_code" != "200" ]; then
        echo "❌ ERROR: Failed to reach SiYuan (HTTP $http_code). Is it running?"
        return 1
    fi

    if echo "$body" | grep -q '"code":0'; then
        local version=$(echo "$body" | grep -o '"data":"[^"]*"' | cut -d '"' -f 4)
        echo "✅ SUCCESS: Connected to SiYuan (Version $version)"
        return 0
    else
        echo "⚠️ WARNING: Reached SiYuan, but authentication failed or got error."
        echo "   Response: $body"
        echo "   Please check your SIYUAN_TOKEN in .env file."
        return 1
    fi
}

case "$1" in
    start)
        check_siyuan_connection | tee -a "$APP_NAME.log"
        echo "Starting local SiYuan MCP server using pm2..." | tee -a "$APP_NAME.log"
        pm2 start "$SERVER_PATH" --name "$APP_NAME"
        pm2 save
        ;;
        
    stop)
        echo "Stopping SiYuan MCP Server..."
        pm2 stop "$APP_NAME"
        ;;
        
    status)
        pm2 describe "$APP_NAME" > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            check_siyuan_connection
            pm2 status "$APP_NAME"
        else
            echo "SiYuan MCP Server ($APP_NAME) is not managed by pm2 or not running."
        fi
        ;;
        
    restart)
        echo "Restarting SiYuan MCP Server..."
        pm2 restart "$APP_NAME"
        check_siyuan_connection | tee -a "$APP_NAME.log"
        ;;
        
    logs)
        pm2 logs "$APP_NAME"
        ;;
        
    *)
        echo "Usage: $0 {start|stop|status|restart|logs}"
        exit 1
        ;;
esac
