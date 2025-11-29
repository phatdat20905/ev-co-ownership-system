FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy shared module (đặt tên trùng với package @ev-coownership/shared)
COPY ../shared ./node_modules/@ev-coownership/shared

# Cài dependencies
RUN npm ci --omit=dev

# Copy toàn bộ source code của auth-service
COPY . .

EXPOSE 3008
CMD ["node", "src/server.js"]
