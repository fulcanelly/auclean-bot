import next from 'next';
import express from 'express'
import { logger } from './utils/logger';



const nextconfig = {}


// TODO add config
const port = 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, conf: nextconfig });
const handle = app.getRequestHandler();


export async function setupNextJs() {
  logger.verbose('starting nexjs')
  app.prepare().then(() => {
    const server = express();

    server.get('*', (req, res) => {
      return handle(req, res);
    });

    server.listen(port, async () => {
      logger.verbose('done nextjs setup')
    })
  })
}
