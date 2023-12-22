import { neogma } from "@/neo4j";
import '@/models/__relations'
import { logger } from "@/utils/logger";
import { ChannelScanLog, ChannelScanLogInstance } from "../models/channel_scan_log";
import { Session, SessionInstance } from "@/models/session";
import moment, { duration } from "moment";
import { channelInstanceMethods } from "@/models/channel_";
import { ChannelInstance } from "@/models/channel";
import { BindParam, QueryBuilder } from "neogma";
import { recordToObject } from "@/utils/record_to_object";
import { info } from "console";
import amqplib from 'amqplib';
import { ChannelScanStatus } from "@/types/channel_scan_status";

// declare module 'a' {

// }

async function markOldScansDead() {

}


async function disable(channel: amqplib.Channel, scanLog: ChannelScanLogInstance) {
	let session = await scanLog.getSession()

	const request = {
		session: session.session_name,
		type: 'remove_job'
	}

	
	channel.sendToQueue('py:chanscan', Buffer.from(JSON.stringify(request)));

	(scanLog.status as ChannelScanStatus) = 'TIMEOUT_FAIL'
	scanLog.finished_at = Date.now()

	await scanLog.save()
}

async function getCurrenltRunningScans(): Promise<void> {
	logger.info('seeking for long running stuck jobs')

	const params = new BindParam({
		now: Date.now(),
		maxTimeout: duration(2, 'minutes').asMilliseconds()
	})

	const result = await new QueryBuilder(params)
		.match({
			related: [
				{
					model: Session,
					identifier: 's'
				},
				Session.getRelationshipByAlias('scan_logs'),
				{
					model: ChannelScanLog,
					identifier: 'c',
					where: {
						status: 'RUNNING'
					}
				},

			]
		})
		.where('$now - c.enrolled_at > $maxTimeout')
		.return('c')
		.run(neogma.queryRunner)

	const scanLogs = result.records.map(recordToObject).map(it => it.c).map(ChannelScanLog.buildFromRecord)

	await scanLogs[0].getSession()



	logger.warn('found records count: ', { count: scanLogs.length })
	// throw ''

}


getCurrenltRunningScans()
