# auclean-bot

### About

In telegram it's common to download music by telegram bots, but they add some marks which may anoy a person.

So this bot intended to solve this problem by removing them in channels and chats



### How to use


Just add bot to channel or cat and give permission to post and delete messages,

send music with adv and then you'll get clean music

###

# standalone
### 1. create network
   
 `docker network create shared_network`

### 3. run `neo4j` and `rmq`
   
`docker-compose -f docker-compose.neo4j.yml up -d --build`

`docker-compose -f docker-compose.rabbitmq.yml up -d --build`

### 4. edit env varibles
   - Set sentry DSNs
   - Adjust passowrds and hosts
   - Set telegram token, api id and hash

### 5. run aaplication (currently only dev env is avaliable)
   
`docker-compose -f docker-compose.rabbitmq.yml up -d --build`

# with external neo4j & rabbitmq

### How to run

Download repo and inside
configure your api key in main.js and then run

```sh
docker-compose up --build

# or with make
make
```

It removes all unneeded (like adverts or bot references) from audio telegram message
