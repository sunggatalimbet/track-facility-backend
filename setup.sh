#!/bin/bash

echo "Setting up development environment..."

# Install curl if not installed
if ! command -v curl &> /dev/null; then
    echo "Installing curl..."
    sudo apt-get update
    sudo apt-get install -y curl
fi

# Install NVM (Node Version Manager)
echo "Installing NVM..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install latest LTS version of Node.js
echo "Installing Node.js LTS..."
nvm install --lts
nvm use --lts

# Install npm (comes with Node.js)
echo "Updating npm to latest version..."
npm install -g npm@latest

# Install pnpm
echo "Installing pnpm..."
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Reload shell configuration
source ~/.bashrc

echo "Installation complete! Please restart your terminal or run:"
echo "source ~/.bashrc"

# Print versions
echo "Installed versions:"
echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"
echo "pnpm: $(pnpm -v)" 