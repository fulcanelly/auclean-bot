import { ChannelScanLog } from '../../../models/channel_scan_log';
import { spy } from '../../../types/spy_packet';
import { ChannelScanStatus } from '../../../types/channel_scan_status';
import { logger } from '@/utils/logger';
import { Type, needs_target } from '@/types/py_chanscan_request';

export async function handleStart(data: spy.Packet) {
	const chanScanLog = await ChannelScanLog.findOne({
		where: {
			uuid: data.log_id
		}
	});

	if (!chanScanLog) {
		return void logger.error('no log')
	}

	const request = JSON.parse(chanScanLog.request) as Type<'full_scan'> & needs_target & { is_regular?: boolean };

	if (request.is_regular) {
		const channel = await chanScanLog.getChannel();
		channel.need_to_scan = Boolean(request.is_regular);
		await channel.save();
	}

	(chanScanLog.status as ChannelScanStatus) = 'RUNNING';
	chanScanLog.started_at = Date.now();
	return await chanScanLog.save();
}
