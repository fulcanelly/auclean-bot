import amqplib from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import { ChannelScanLog, ChannelScanLogInstance } from '../models/channel_scan_log';
import { Session, SessionInstance } from '../models/session';
import { ChannelScanStatus } from '../types/channel_scan_status';
import { py_chanscan_request } from '../types/py_chanscan_request';
import { logger } from '@/utils/logger';
import moment from 'moment';
import { relate } from '@/utils/neo4j/relate';
import { relateTo } from '@/utils/neo4j/relateTo';


export async function initFirstScan(channel: amqplib.Channel, session: SessionInstance, identifier: string, is_regular?: boolean): Promise<ChannelScanLogInstance> {
	const request: py_chanscan_request = {
		session: session!.session_name,
		identifier,
		type: 'full_scan',
		is_regular
	};

	const log = await ChannelScanLog.createOne({
		attempts: 0,
		uuid: uuidv4(),
		enrolled_at: moment().unix(),
		status: 'INIT' as ChannelScanStatus,
		request: JSON.stringify(request),
		started_at: 0,
		finished_at: 0,
	});

	await relate(session)
		.scan_logs
		.where({uuid: log.uuid})
		.save()

	const dataToSpy: py_chanscan_request = {
		...request,
		log_id: log.uuid
	};

	logger.verbose({
		queueu: 'py:chanscan',
		dataToSpy
	})

	channel.sendToQueue('py:chanscan', Buffer.from(JSON.stringify(dataToSpy)));

	return log;
}
