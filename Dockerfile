FROM node:7
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .
RUN npm install

COPY . .

EXPOSE 5000
CMD [ "npm", "start" ]