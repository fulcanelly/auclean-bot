import amqplib from 'amqplib';
import { config } from "@/config"
import { defaultSetup } from '.';
import { py_chanscan_request } from '@/types/py_chanscan_request';
import { Channel } from '@/models/channel';
import { logger } from '@/utils/logger';



declare module '@/config' {
  namespace config {
    interface JobConfigs {
      regular_channel_scan: DefaultModuleSettings & {
        rescan_interval: Interval
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

      const scanRequest: py_chanscan_request = {
        type: 'recent_scan',
        session: session.session_name!,
        identifier: channelToScan.username!
      };

      amqpChannel.sendToQueue('py:chanscan', Buffer.from(JSON.stringify(scanRequest)));
    }


    defaultSetup(performChannelScan, myConfig, amqpChannel)

  }
}
