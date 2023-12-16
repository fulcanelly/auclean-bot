import next from 'next';
import express from 'express'


console.log('starting')

const nextconfig = {}

console.log(nextconfig)

// TODO add config
const port = 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, conf: nextconfig });
const handle = app.getRequestHandler();


export async function setupNextJs() {
  console.log('starting nexjs')
  app.prepare().then(() => {
    const server = express();

    server.get('*', (req, res) => {
      return handle(req, res);
    });

    server.listen(port, async () => {
      console.log('done setup')
    })
  })
}
