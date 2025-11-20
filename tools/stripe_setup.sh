#!/bin/bash

# Wrapper for the Node.js Stripe setup script
# Ensures environment variables are loaded

if [ -f .env ]; then
  export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "Error: STRIPE_SECRET_KEY is not set in .env"
  exit 1
fi

echo "Running Stripe setup (Node.js)..."
node tools/stripe_setup_node.js
