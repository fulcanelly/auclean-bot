import amqplib from 'amqplib';
import { ChannelScanLog } from '../../../models/channel_scan_log';

import { spy } from '../../../types/spy_packet';
import { logSummary } from '../../../utils/log_summary';
import { ChannelScanStatus } from '../../../types/channel_scan_status';

export async function handleFinish(channel: amqplib.Channel, data: spy.Packet) {
	const chanScanLog = await ChannelScanLog.findOne({
		where: {
			uuid: data.log_id
		}
	});
	chanScanLog!.finished_at = Date.now();

	const status = chanScanLog!.status as ChannelScanStatus

	if (!(status == 'TIMEOUT_FAIL' || status == 'FAIL')) {
		(chanScanLog!.status as ChannelScanStatus) = 'DONE'
	}


	await chanScanLog?.save();

	const session = await chanScanLog?.getSession()

	const request = {
		scan_summary: await logSummary(chanScanLog!),
		user_id: session!.user_id
	};

	channel.sendToQueue('tg:login:answer', Buffer.from(JSON.stringify(request)));
}
