# Use the official Node.js 18 LTS image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY ./package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code to the working directory
COPY . .

# Expose the port server will use
EXPOSE 5173

# Start the app 
CMD ["npm", "run", "dev", "--", "--host"]
