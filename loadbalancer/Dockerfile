# Use official Node.js image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json, then install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Start the balancer
CMD ["node", "balancer.js"]