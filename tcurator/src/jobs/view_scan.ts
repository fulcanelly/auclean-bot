import amqplib from 'amqplib';
import { config } from "@/config"
import { defaultSetup } from '.';
import { Channel } from '@/models/channel';
import { logger } from '@/utils/logger';

import { initRecentScan } from '../services/init_recent_scan';


declare module '@/config' {
  namespace config {
    interface JobConfigs {
      regular_channel_scan: DefaultModuleSettings & {
        rescan_interval: Interval
        days_to_check: number
      }
    }
  }
}



export namespace regular_scan {
  export const setup = (allConfig: config.Config, amqpChannel: amqplib.Channel) => {
    const myConfig = allConfig.jobs.regular_channel_scan
    const rescanInterval = config.extractDurationFromInterval(myConfig.rescan_interval)

    const performChannelScan = async (): Promise<void> => {
      logger.info('Initiating regular channel scan.');

      const channelToScan = await Channel.findNotScannedFor(rescanInterval);

      if (!channelToScan) {
        return void logger.warn('No channel requires scanning at the moment.');
      }
      logger.info(`Channel identified for scanning: ${channelToScan?.username}`);


      const session = await channelToScan.getSessionAddedBy();

      if (!session) {
        return void logger.warn(`No session associated with channel ${channelToScan.username}. Skipping scan.`);
      }

      logger.info(`Session retrieved for channel ${channelToScan.username}: ${session?.session_name}`);

      if (await session.isBussy()) {
        return void logger.warn(`Session ${session.session_name} is currently busy. Scan postponed.`);
      }


      logger.info(`Sending scan request for channel ${channelToScan.username}.`);
      initRecentScan(channelToScan, session, amqpChannel)
    }


    defaultSetup(performChannelScan, myConfig, amqpChannel)

  }
}


