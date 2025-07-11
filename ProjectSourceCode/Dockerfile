FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with verbose logging
RUN npm ci --only=production --verbose

# Copy source code
COPY . .

EXPOSE 8080

CMD ["npm", "start"]