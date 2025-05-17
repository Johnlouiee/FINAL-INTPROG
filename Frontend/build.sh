#!/bin/bash
set -e

# Clean node_modules and package-lock.json
rm -rf node_modules
rm -f package-lock.json

# Install dependencies
npm install

# Install Angular CLI and build-angular globally
npm install -g @angular/cli@15.2.10
npm install -g @angular-devkit/build-angular@15.2.10

# Install build-angular locally with exact version
npm install @angular-devkit/build-angular@15.2.10 --save-dev --exact

# Set environment variables
export PATH=$PATH:$(npm config get prefix)/bin
export NODE_OPTIONS=--max_old_space_size=4096

# Clean previous build
rm -rf dist

# Build the application
ng build --configuration production --base-href=/ --output-path=dist/final-intprog

# Create _redirects file for SPA routing
cat > dist/final-intprog/_redirects << EOL
/* /index.html 200
/assets/* /assets/:splat 200
EOL

# Create .htaccess file for Apache
cat > dist/final-intprog/.htaccess << EOL
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Prevent caching
Header set Cache-Control "no-cache, no-store, must-revalidate"
Header set Pragma "no-cache"
Header set Expires 0
EOL 