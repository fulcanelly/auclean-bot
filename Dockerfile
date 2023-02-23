FROM node:16-alpine

USER node

WORKDIR /home/node

COPY --chown=node:node . .

RUN npm --silent i

CMD [ "node", "main.js" ]
