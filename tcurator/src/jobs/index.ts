import amqplib from 'amqplib';
import { retryBrokenScanRequests } from './scan_retry';

export async function setupScheduledJobs(client: amqplib.Connection) {
    const channel = await client.createChannel()
    setInterval(retryBrokenScanRequests, 10_000, channel)
}
