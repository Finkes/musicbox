FROM node:6.7

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
COPY tsconfig.json /usr/src/app/tsconfig.json
RUN npm install

COPY ./src /usr/src/app/src
VOLUME /usr/src/app/data
# COPY ./data /usr/src/app/data
RUN npm run build

EXPOSE 4000
CMD [ "npm", "start" ]
