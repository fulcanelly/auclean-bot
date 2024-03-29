import amqplib from 'amqplib';
import { py_chanscan_request } from '@/types/py_chanscan_request';
import { ChannelInstance } from '@/models/channel';
import { ChannelScanLog } from '@/models/channel_scan_log';
import { Session, SessionInstance } from '@/models/session';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';
import { config } from '@/config';
import moment from 'moment';
import { relate } from '@/utils/neo4j/relate';
import { relateTo } from '@/utils/neo4j/relateTo';

export async function initRecentScan(channelToScan: ChannelInstance, session: SessionInstance, amqpChannel: amqplib.Channel) {
  if (await isAlreadyInitiated(channelToScan)) {
    logger.error('already initited ')
    return
  }
  const log = await ChannelScanLog.createOne({
    uuid: uuidv4(),
    enrolled_at: moment().unix(),
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
    days: config.appConfig.jobs.regular_channel_scan.days_to_check
  };

  log.request = JSON.stringify(scanRequest);

  await relate(session)
    .scan_logs
    .where({ uuid: log.uuid })
    .save()

  await log.save()

  logger.verbose("sending to py:chanscan", scanRequest)
  amqpChannel.sendToQueue('py:chanscan', Buffer.from(JSON.stringify(scanRequest)));
}

async function isAlreadyInitiated(channelToScan: ChannelInstance) {
  const logs = await ChannelScanLog.findMany({
    where: {
      status: 'INIT'
    }
  })

  for (const log of logs) {
    const request = JSON.parse(log.request) as py_chanscan_request
    if (request.type === 'recent_scan' && request.identifier === channelToScan.username) {
      return true
    }
  }

  return false
}
