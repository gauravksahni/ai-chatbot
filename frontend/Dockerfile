# Build stage
FROM node:16-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config for handling React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output
COPY --from=build /app/build /usr/share/nginx/html

# Add DNS resolution check on startup
COPY docker-entrypoint.sh /


# Expose port 80
EXPOSE 80

# Start nginx with our custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]