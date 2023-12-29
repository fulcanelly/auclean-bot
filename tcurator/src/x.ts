import '@/utils/patch'
import '@/rmq'
import './neo4j'
import "./models/__relations"

import { scan_timout } from './jobs/mark_old_scans_dead';
import { config } from '@/config';
import { setupRmq } from '@/rmq';


async function ok() {
    const conn = await setupRmq()
    scan_timout.setup(config.appConfig, await conn.createChannel())
}


ok()
