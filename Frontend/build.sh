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
ng build --configuration production --base-href=/ --output-path=dist/final-intprog

# Create _redirects file for SPA routing
echo "/* /index.html 200" > dist/final-intprog/_redirects

# Create .htaccess file for Apache
cat > dist/final-intprog/.htaccess << EOL
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
EOL 