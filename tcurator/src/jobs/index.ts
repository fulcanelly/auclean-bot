import amqplib from 'amqplib';
import { scan_retry } from './scan_retry';
import { scanRecursivellyNewChannels, scan_rec } from './scan_recursivelly';
import { appConfig, config } from '@/config';
import { logger } from '@/utils/logger';
import { scan_timout } from './mark_old_scans_dead';

type JobType<T = any> = (_: amqplib.Channel) => Promise<T>

export async function setupScheduledJobs(client: amqplib.Connection) {
    const setups = [
        scan_rec,
        scan_retry,
        scan_timout,
    ].map(it => it.setup)

    const channel = await client.createChannel()
    await Promise.all(setups.map(it => it(appConfig, channel)))
}

export async function defaultSetup(job: JobType, defaultConfig: config.DefaultModuleSettings, channel: amqplib.Channel) {

    if (!defaultConfig.enabled) {
        logger.error('Not enabled, skipping', { name: defaultConfig.name })
        return
    }

    if (defaultConfig.run_at_start) {
        logger.silly('Initial job run', { name: defaultConfig.name })
        await job(channel)
    }

    logger.silly('Setup interval', { name: defaultConfig.name, timeout: defaultConfig.timeout })
    setInterval(job, defaultConfig.timeout, channel)
}
