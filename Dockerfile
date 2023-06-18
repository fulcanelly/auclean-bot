FROM node:16-alpine

USER node

WORKDIR /home/node

COPY --chown=node:node ./package.json .

RUN npm --silent i

USER root

RUN apk update && \
    apk add --no-cache python3 ffmpeg ca-certificates && \
    python3 -m ensurepip && \
    pip3 install --upgrade pip setuptools && \
    pip3 install yt-dlp
    
CMD [ "node", "src/main.js" ]
