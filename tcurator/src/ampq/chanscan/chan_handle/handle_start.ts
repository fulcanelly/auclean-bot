import { ChannelScanLog } from '../../../models/channel_scan_log';
import { spy } from '../../../types/spy_packet';

export async function handleStart(data: spy.Packet) {
	const chanScanLog = await ChannelScanLog.findOne({
		where: {
			uuid: data.log_id
		}
	});
	chanScanLog!.started_at = Date.now();
	return await chanScanLog?.save();
}
