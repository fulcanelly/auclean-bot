
import { iterateQueryBuilder } from "../utils/iterate"
import amqplib from 'amqplib';
import * as R from 'ramda'
import { QueryBuilder, QueryRunner } from 'neogma';
import { ChannelScanLog, ChannelScanLogInstance, ChannelScanLogProps } from "../models/channel_scan_log";
import { sentry } from "../sentry";
import { logger } from "../utils/logger";



async function queueIfSessionAvailable(channel: amqplib.Channel, log: ChannelScanLogInstance) {
	logger.info('checking is busy')
	const session = await log.getSession()

	if (await session.isBussy()) {
		logger.warn('session is bussy, will try later')
		return
	}

	const request = {
		...JSON.parse(log.request),
		log_id: log.uuid,
	}

	logger.info('retrying', {
		queue: 'py:chanscan',
		request
	})

	channel.sendToQueue('py:chanscan', Buffer.from(JSON.stringify(request)))
}

export async function retryBrokenScanRequests(channel: amqplib.Channel): Promise<boolean> {

	try {
		logger.info('seeking for broken queries')

		const qb = () => new QueryBuilder()
			.match({
				model: ChannelScanLog,
				identifier: 'c'
			})
			.where('(timestamp() - c.enrolled_at) > 10_000 AND c.enrolled_at <> 0 AND c.status IN ["INIT"] AND c.request IS NOT NULL')
			.return('c')


		for await (let queryResult of iterateQueryBuilder(qb, 1)) {

			const result = QueryRunner.getResultProperties<ChannelScanLogProps>(queryResult, 'c')
				.map(it =>  ChannelScanLog.buildFromRecord({
					properties: it,
					labels: [ ChannelScanLog.getLabel() ]
				}))
				.map(R.curry(queueIfSessionAvailable)(channel))

			await Promise.all(result)
			if (result.length) {
				return true
			}
		}
	} catch(e) {
		sentry.captureException(e)
		logger.error(e)
	}
	return false
}
