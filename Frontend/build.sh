#!/bin/bash

# Clean up previous builds
rm -rf dist
rm -rf node_modules

# Install dependencies
npm install

# Build the application
npm run build

# Create necessary files for static hosting
echo "/* /index.html 200" > dist/final-intprog/_redirects
echo "/assets/* /assets/:splat 200" >> dist/final-intprog/_redirects

# Create .htaccess for Apache servers
cat > dist/final-intprog/.htaccess << EOL
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
EOL

# Ensure proper permissions
chmod -R 755 dist/final-intprog 