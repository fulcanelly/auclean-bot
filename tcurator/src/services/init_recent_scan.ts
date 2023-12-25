import amqplib from 'amqplib';
import { py_chanscan_request } from '@/types/py_chanscan_request';
import { ChannelInstance } from '@/models/channel';
import { ChannelScanLog } from '@/models/channel_scan_log';
import { SessionInstance } from '@/models/session';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';

export async function initRecentScan(channelToScan: ChannelInstance, session: SessionInstance, amqpChannel: amqplib.Channel) {
  const log = await ChannelScanLog.createOne({
    uuid: uuidv4(),
    enrolled_at: Date.now(),
    started_at: 0,
    finished_at: 0,
    request: '',
    status: 'INIT',
    attempts: 0
  });

  const scanRequest: py_chanscan_request = {
    type: 'recent_scan',
    session: session.session_name!,
    identifier: channelToScan.username!,
    log_id: log.uuid,
    days: 30,
  };

  log.request = JSON.stringify(scanRequest);

  await session?.relateTo({
		alias: 'scan_logs',
		where: {
			uuid: log.uuid
		}
	});
  await log.save()

  logger.verbose("sending to py:chanscan", scanRequest)
  amqpChannel.sendToQueue('py:chanscan', Buffer.from(JSON.stringify(scanRequest)));
}
