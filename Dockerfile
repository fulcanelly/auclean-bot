FROM node:16-alpine

USER node

WORKDIR /home/node

COPY --chown=node:node ./package.json .

RUN npm --silent i

USER root

RUN npm install -g nodemon

USER node


CMD [ "node", "src/main.js" ]
