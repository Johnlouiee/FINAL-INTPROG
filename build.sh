#!/bin/bash

# Clean up
rm -rf Frontend/node_modules
rm -f Frontend/package-lock.json

# Install dependencies
cd Frontend
npm install

# Install Angular CLI and build-angular globally
npm install -g @angular/cli@15.2.10
npm install -g @angular-devkit/build-angular@15.2.10

# Install build-angular locally
npm install @angular-devkit/build-angular@15.2.10 --save-dev

# Set environment variables
export NODE_OPTIONS=--max_old_space_size=4096
export NODE_ENV=production

# Clean previous build
rm -rf dist

# Build the application
ng build --configuration production

# Create _redirects file for SPA routing
echo "/* /index.html 200" > dist/final-intprog/_redirects

# Create .htaccess file for SPA routing
cat > dist/final-intprog/.htaccess << EOL
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
EOL

# Return to root directory
cd .. 