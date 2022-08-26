FROM node:16

COPY . . 

RUN npm i 

CMD [ "node", "main.js" ]
