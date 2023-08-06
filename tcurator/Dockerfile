FROM node:16-alpine

USER node

WORKDIR /app

# COPY --chown=node:node ./package.json .
# COPY --chown=node:node ./yarn.lock .

# RUN yarn

# # USER root

# RUN yarn add nodemon

# # USER node

CMD [ "yarn", "run", "nodemon", "--exec", "ts-node", "./src/main.ts" ]
