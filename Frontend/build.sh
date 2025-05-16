#!/bin/bash

# Install dependencies
npm install

# Build the application
npm run build

# Exit with the last command's status
exit $? 