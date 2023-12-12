import amqplib from 'amqplib';
import { retryBrokenScanRequests } from './scan_retry';
import { scanRecursivellyNewChannels } from './scan_recursivelly';

type JobType = (_: amqplib.Channel) => Promise<Boolean>

export async function setupScheduledJobs(client: amqplib.Connection) {
    const channel = await client.createChannel()
    setInterval(handle, 10_000, channel)
}

async function handle(channel: amqplib.Channel) {
    const jobs: JobType[] = [
        retryBrokenScanRequests,
        scanRecursivellyNewChannels,
    ]

    for (const job of jobs) {
        if (await job(channel)) {
            return
        }
    }

}
