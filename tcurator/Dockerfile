FROM node:16-alpine

USER node

WORKDIR /app

RUN chown -R node:node /app/

COPY --chown=node:node ./package.json .
COPY --chown=node:node ./yarn.lock .

RUN yarn

# # USER root

# RUN yarn add nodemon

# # USER node

CMD [ "yarn", "run", "ts-node", "./src/main.ts" ]
