import amqplib from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import { ChannelScanLog, ChannelScanLogInstance } from '../models/channel_scan_log';
import { Session, SessionInstance } from '../models/session';
import { ChannelScanStatus } from '../types/channel_scan_status';


export async function initFirstScan(channel: amqplib.Channel, session: SessionInstance, identifier: string): Promise<ChannelScanLogInstance> {
	const request = {
		session: session!.session_name,
		identifier,
	};

	const log = await ChannelScanLog.createOne({
		uuid: uuidv4(),
		enrolled_at: Date.now(),
		status: 'INIT' as ChannelScanStatus,
		request: JSON.stringify(request),
		started_at: 0,
		finished_at: 0
	});

	await session?.relateTo({
		alias: 'scan_logs',
		where: {
			uuid: log.uuid
		}
	});

	const dataToSpy = {
		...request,
		log_id: log.uuid
	};

	console.log({
		queueu: 'py:chanscan',
		dataToSpy
	})

	channel.sendToQueue('py:chanscan', Buffer.from(JSON.stringify(dataToSpy)));

	return log;
}
