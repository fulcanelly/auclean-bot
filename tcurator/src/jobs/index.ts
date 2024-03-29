import amqplib from 'amqplib';
import { scan_retry } from './scan_retry';
import { scan_rec } from './scan_recursivelly';
import { config } from '../config';
import { logger } from '@/utils/logger';
import { scan_timout } from './mark_old_scans_dead';
import { regular_scan } from './view_scan';
import { sentry } from '@/sentry';

type JobType<T = any> = (_: amqplib.Channel) => Promise<T>

export async function setupScheduledJobs(client: amqplib.Connection) {
    const setups = [
        scan_rec,
        scan_retry,
        scan_timout,
        regular_scan,
    ].map(it => it.setup)

    const channel = await client.createChannel()
    await Promise.all(setups.map(it => it(config.appConfig, channel)))
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

    const interval = config.extractDurationFromInterval(defaultConfig.interval)

    logger.silly('Setup interval', { name: defaultConfig.name, interval: interval.humanize() })
    setInterval((c) => {
        try {
            job(c)
        } catch(e) {
            sentry.captureException(e)
            logger.error(e)
            throw e
        }
    }, interval.asMilliseconds(), channel)
}
