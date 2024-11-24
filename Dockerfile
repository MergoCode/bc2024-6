FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Install nodemon as a development dependency
RUN npm install nodemon --save-dev

# Copy the rest of the application code
COPY . .

# Create cache directory
RUN mkdir -p /app/cache

# Expose ports for the server and debugging
EXPOSE 3000 9229


# Command to run the application with nodemon
CMD npx nodemon --legacy-watch -- --inspect main.js -h localhost -p 3000 -c ./cache
