#!/bin/bash

# Catálogo Productos - Deployment Script
# This script helps deploy updates to the API server

# Set colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Catálogo Productos Deployment Tool   ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if the required programs are installed
command -v git >/dev/null 2>&1 || { echo -e "${RED}Error: git is not installed. Please install git and try again.${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}Error: npm is not installed. Please install Node.js and npm and try again.${NC}" >&2; exit 1; }

# Default values
SERVER_DIR="./api"
GIT_BRANCH="main"
UPDATE_CORS=false
NEW_ORIGIN=""
ENV_FILE="$SERVER_DIR/.env"

# Function to display help
show_help() {
  echo -e "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help               Show this help message and exit"
  echo "  -d, --directory DIR      Specify the server directory (default: ./api)"
  echo "  -b, --branch BRANCH      Specify the git branch to pull (default: main)"
  echo "  -c, --cors ORIGIN        Add a new origin to CORS allowed list"
  echo "  -i, --install            Install or update dependencies"
  echo "  -r, --restart            Restart the server after deployment"
  echo ""
  echo "Examples:"
  echo "  $0 --cors https://myapp.vercel.app --restart"
  echo "  $0 --directory /path/to/api --install --restart"
  echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      show_help
      exit 0
      ;;
    -d|--directory)
      SERVER_DIR="$2"
      shift 2
      ;;
    -b|--branch)
      GIT_BRANCH="$2"
      shift 2
      ;;
    -c|--cors)
      UPDATE_CORS=true
      NEW_ORIGIN="$2"
      shift 2
      ;;
    -i|--install)
      INSTALL_DEPS=true
      shift
      ;;
    -r|--restart)
      RESTART_SERVER=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      show_help
      exit 1
      ;;
  esac
done

# Check if directory exists
if [ ! -d "$SERVER_DIR" ]; then
  echo -e "${RED}Error: Directory $SERVER_DIR does not exist.${NC}"
  exit 1
fi

# Go to server directory
cd "$SERVER_DIR" || { echo -e "${RED}Error: Could not enter directory $SERVER_DIR${NC}"; exit 1; }
echo -e "${GREEN}Changed to directory: ${YELLOW}$(pwd)${NC}"

# Update code from git if it's a git repository
if [ -d ".git" ]; then
  echo -e "${BLUE}Updating code from git...${NC}"
  git fetch || { echo -e "${RED}Error: Failed to fetch from git repository.${NC}"; exit 1; }
  git checkout "$GIT_BRANCH" || { echo -e "${RED}Error: Failed to checkout branch $GIT_BRANCH.${NC}"; exit 1; }
  git pull || { echo -e "${RED}Error: Failed to pull from git repository.${NC}"; exit 1; }
  echo -e "${GREEN}Successfully updated code from git branch ${YELLOW}$GIT_BRANCH${NC}"
fi

# Update CORS settings if requested
if [ "$UPDATE_CORS" = true ] && [ -n "$NEW_ORIGIN" ]; then
  echo -e "${BLUE}Updating CORS settings...${NC}"

  # Create .env file if it doesn't exist
  if [ ! -f "$ENV_FILE" ]; then
    echo "ALLOWED_ORIGINS=\"http://localhost:4200,http://localhost:3000,https://productosdonjoaquin.vercel.app\"" > "$ENV_FILE"
    echo -e "${GREEN}Created new .env file with default CORS settings${NC}"
  fi

  # Check if ALLOWED_ORIGINS is already in .env
  if grep -q "ALLOWED_ORIGINS=" "$ENV_FILE"; then
    # Get current allowed origins
    CURRENT_ORIGINS=$(grep "ALLOWED_ORIGINS=" "$ENV_FILE" | cut -d '"' -f2)

    # Check if origin is already in the list
    if [[ "$CURRENT_ORIGINS" == *"$NEW_ORIGIN"* ]]; then
      echo -e "${YELLOW}Origin $NEW_ORIGIN is already in the allowed list${NC}"
    else
      # Add the new origin
      NEW_ORIGINS="$CURRENT_ORIGINS,$NEW_ORIGIN"
      sed -i.bak "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=\"$NEW_ORIGINS\"|" "$ENV_FILE" && rm -f "${ENV_FILE}.bak"
      echo -e "${GREEN}Added $NEW_ORIGIN to ALLOWED_ORIGINS in .env${NC}"
    fi
  else
    # Add ALLOWED_ORIGINS to .env
    echo "ALLOWED_ORIGINS=\"http://localhost:4200,http://localhost:3000,https://productosdonjoaquin.vercel.app,$NEW_ORIGIN\"" >> "$ENV_FILE"
    echo -e "${GREEN}Added ALLOWED_ORIGINS with $NEW_ORIGIN to .env${NC}"
  fi
fi

# Install dependencies if requested
if [ "$INSTALL_DEPS" = true ]; then
  echo -e "${BLUE}Installing dependencies...${NC}"
  npm ci || npm install || { echo -e "${RED}Error: Failed to install dependencies.${NC}"; exit 1; }
  echo -e "${GREEN}Successfully installed dependencies${NC}"
fi

# Restart the server if requested
if [ "$RESTART_SERVER" = true ]; then
  echo -e "${BLUE}Restarting server...${NC}"

  # Check if pm2 is installed
  if command -v pm2 >/dev/null 2>&1; then
    # Restart with pm2
    pm2 restart all || { echo -e "${RED}Error: Failed to restart server with pm2.${NC}"; exit 1; }
    echo -e "${GREEN}Successfully restarted server with pm2${NC}"
  else
    echo -e "${YELLOW}Warning: pm2 is not installed. Please restart your server manually.${NC}"
    echo "You can install pm2 globally with: npm install -g pm2"
  fi
fi

echo ""
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}What to do next:${NC}"

if [ "$RESTART_SERVER" != true ]; then
  echo -e "${YELLOW}- Restart your server to apply changes${NC}"
fi

if [ "$UPDATE_CORS" = true ]; then
  echo -e "${YELLOW}- Your server now accepts requests from: $NEW_ORIGIN${NC}"
fi

echo -e "${YELLOW}- Check server logs to verify everything is working correctly${NC}"
echo ""
