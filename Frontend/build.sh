#!/bin/bash
set -e

# Install dependencies
npm install

# Install Angular CLI globally
npm install -g @angular/cli@17.3.10

# Set environment variables
export PATH=$PATH:$(npm config get prefix)/bin
export NODE_OPTIONS=--max_old_space_size=4096

# Build the application
ng build --configuration production 