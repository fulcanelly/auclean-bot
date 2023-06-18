FROM node:16-alpine

USER node

WORKDIR /home/node

COPY --chown=node:node ./package.json .

RUN npm --silent i

CMD [ "node", "src/main.js" ]
