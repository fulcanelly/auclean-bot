import { neogma } from "@/neo4j";
import '@/models/__relations'
import { logger } from "@/utils/logger";
import { ChannelScanLog, ChannelScanLogInstance } from "../models/channel_scan_log";
import { Session } from "@/models/session";
import { duration } from "moment";
import { BindParam, QueryBuilder } from "neogma";
import { recordToObject } from "@/utils/record_to_object";
import amqplib from 'amqplib';
import { ChannelScanStatus } from "@/types/channel_scan_status";
import { config } from "@/config";
import { defaultSetup } from ".";

declare module "../config" {
  namespace config {
    interface Modules {
      scan_timout_job: DefaultModuleSettings
    }
  }
}

export namespace scan_timout {
  export const setup = (config: config.Config, channel: amqplib.Channel) => {

    async function getCurrenltRunningScans(): Promise<void> {
      logger.warn('Seeking for long running stuck jobs')

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

      const scanLogs = result.records.map(recordToObject).map(it => it.c).map(ChannelScanLog.buildFromRecord).map(disable)

      logger.warn('found records count: ', { count: scanLogs.length })
    }

    async function disable(scanLog: ChannelScanLogInstance) {
      logger.info("Found ")
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

    defaultSetup(getCurrenltRunningScans, config.modules.scan_timout_job, channel)
  }
}



