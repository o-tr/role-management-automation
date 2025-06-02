#!/usr/bin/env sh

set -e

# Check if .env.placeholder exists
if [ ! -f ".env.placeholder" ]; then
  exec "$@"
fi

# Read environment variable names from .env.placeholder and process only those
grep -E '^[A-Za-z_][A-Za-z0-9_]*=' .env.placeholder | while IFS='=' read -r ENV_KEY _; do
  # Get the actual environment variable value
  ENV_VALUE=$(printenv "$ENV_KEY" || echo "")
  
  # Skip if environment variable is not set
  if [ -z "$ENV_VALUE" ]; then
    echo "Warning: Environment variable $ENV_KEY is not set"
    continue
  fi
  
  # Find all the places where our intermediate values are set and replace them using actual values
  find .next -type f -exec sed -i "s|_${ENV_KEY}_|${ENV_VALUE}|g" {} \;
done

# Execute the application main command
exec "$@"