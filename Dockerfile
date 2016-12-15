FROM node:4.5
EXPOSE 8080

COPY * ./

# Provides cached layer for node_modules
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /src && cp -a /tmp/node_modules /src/

# Define working directory
WORKDIR /src
ADD . /src

COPY server.js .
CMD node server.js
