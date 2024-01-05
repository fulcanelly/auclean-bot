import fs from 'fs';
import { promisify } from 'util';

const readFilePromise = promisify(fs.readFile);




export namespace queires {
    export const topPopularPosts = () => readFilePromise('./public/queries/most_viewed.cypher', 'utf-8')
    export const notScanedFor = () => readFilePromise('./public/queries/channels_to_rescan.cypher', 'utf-8')
    export const avgCoverage = () => readFilePromise('./public/queries/avg_coverage.cypher', 'utf-8')
}
