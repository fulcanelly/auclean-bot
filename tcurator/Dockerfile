FROM node:16-alpine

USER node

WORKDIR /app

USER root
RUN chown -R node:node /app/

USER node

COPY --chown=node:node ./package.json .
COPY --chown=node:node ./yarn.lock .

RUN yarn

# # USER root

# RUN yarn add nodemon

# # USER node

CMD [ "yarn", "run", "ts-node", "./src/main.ts" ]
