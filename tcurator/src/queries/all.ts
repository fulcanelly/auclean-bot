import fs from 'fs';
import { promisify } from 'util';

const readFilePromise = promisify(fs.readFile);




export namespace queires {
    export const topPopularPosts = () => readFilePromise('./public/queries/most_viewed.cypher', 'utf-8')
    export const notScanedFor = () => readFilePromise('./public/queries/channels_to_rescan.cypher', 'utf-8')
    export const leastReferencedNeverScannedPublicChannel = () => readFilePromise('./public/queries/least_reposted_public_channel.cypher', 'utf-8')
}
