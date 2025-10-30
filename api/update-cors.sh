#!/bin/bash

# update-cors.sh - Script to update CORS allowed origins in .env file
# This script adds or updates the ALLOWED_ORIGINS environment variable

# Default origins if not provided
DEFAULT_ORIGINS="http://localhost:4200,http://localhost:3000,https://productosdonjoaquin.vercel.app,https://catalogo-productos-2g21n7q5g.vercel.app"

# Get the directory of the script
SCRIPT_DIR="$(dirname "$0")"
ENV_FILE="${SCRIPT_DIR}/.env"

# Function to display usage information
usage() {
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  -a, --add ORIGIN     Add a new origin to the allowed list"
  echo "  -r, --reset          Reset to default origins"
  echo "  -l, --list           List current allowed origins"
  echo "  -h, --help           Display this help message"
  echo ""
  echo "Examples:"
  echo "  $0 --add https://myapp.vercel.app"
  echo "  $0 --reset"
  echo "  $0 --list"
}

# Check if .env file exists, create if not
if [ ! -f "$ENV_FILE" ]; then
  echo "Creating .env file with default CORS settings..."
  echo "ALLOWED_ORIGINS=\"$DEFAULT_ORIGINS\"" > "$ENV_FILE"
  echo "Created .env file with default CORS origins"
else
  # Check if ALLOWED_ORIGINS exists in .env
  if ! grep -q "ALLOWED_ORIGINS=" "$ENV_FILE"; then
    echo "Adding ALLOWED_ORIGINS to .env file..."
    echo "ALLOWED_ORIGINS=\"$DEFAULT_ORIGINS\"" >> "$ENV_FILE"
  fi
fi

# Get current ALLOWED_ORIGINS value
get_current_origins() {
  grep "ALLOWED_ORIGINS=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' || echo "$DEFAULT_ORIGINS"
}

# List current allowed origins
list_origins() {
  echo "Currently allowed origins:"
  origins=$(get_current_origins)
  IFS=',' read -ra ORIGINS_ARRAY <<< "$origins"
  for origin in "${ORIGINS_ARRAY[@]}"; do
    echo "  - $origin"
  done
}

# Reset to default origins
reset_origins() {
  sed -i.bak "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=\"$DEFAULT_ORIGINS\"|" "$ENV_FILE"
  echo "Reset ALLOWED_ORIGINS to default values"
  list_origins
}

# Add a new origin to the allowed list
add_origin() {
  new_origin="$1"

  # Validate URL format
  if [[ ! "$new_origin" =~ ^https?:// ]]; then
    echo "Error: Origin must start with http:// or https://"
    exit 1
  fi

  current=$(get_current_origins)

  # Check if origin already exists
  if [[ "$current" == *"$new_origin"* ]]; then
    echo "Origin $new_origin is already in the allowed list"
    exit 0
  fi

  # Add the new origin
  new_value="$current,$new_origin"
  sed -i.bak "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=\"$new_value\"|" "$ENV_FILE"

  echo "Added $new_origin to allowed origins"
  list_origins
}

# Parse command line arguments
if [ $# -eq 0 ]; then
  usage
  exit 0
fi

while [ $# -gt 0 ]; do
  case "$1" in
    -a|--add)
      if [ -z "$2" ]; then
        echo "Error: --add requires an origin URL"
        exit 1
      fi
      add_origin "$2"
      shift 2
      ;;
    -r|--reset)
      reset_origins
      shift
      ;;
    -l|--list)
      list_origins
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Error: Unknown option $1"
      usage
      exit 1
      ;;
  esac
done

echo ""
echo "IMPORTANT: After updating CORS settings, you need to restart your API server for changes to take effect."
