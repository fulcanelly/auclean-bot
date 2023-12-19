import fs from 'fs';
import { promisify } from 'util';

const readFilePromise = promisify(fs.readFile);




export const topPopularPosts = () => readFilePromise('./public/queries/most_viewed.cypher', 'utf-8')
