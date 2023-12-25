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
import { py_chanscan_request } from "@/types/py_chanscan_request";

declare module "../config" {
  namespace config {
    interface JobConfigs {
      scan_timout_job: DefaultModuleSettings & {
        max_timeout: number | moment.Duration
      }
    }
  }
}

export namespace scan_timout {
  export const setup = (allconfig: config.Config, channel: amqplib.Channel) => {
    const myConfig = allconfig.jobs.scan_timout_job

    async function getCurrenltRunningScans(): Promise<void> {
      logger.warn('Seeking for long running stuck jobs')

      const params = new BindParam({
        now: Date.now(),
        maxTimeout: config.extractDurationFromInterval(myConfig.max_timeout).asMilliseconds()
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
      try {
        logger.info("Found ")
        let session = await scanLog.getSession()

        if (!session) {
          return void logger.error('no session related to log')
        }
        const request: py_chanscan_request = {
          session: session.session_name,
          type: 'remove_job'
        }

        logger.verbose("sending to py:chanscan", request)
        channel.sendToQueue('py:chanscan', Buffer.from(JSON.stringify(request)));
      } finally {
        (scanLog.status as ChannelScanStatus) = 'TIMEOUT_FAIL'
        scanLog.finished_at = Date.now()

        await scanLog.save()
      }

    }

    defaultSetup(getCurrenltRunningScans, myConfig, channel)
  }
}



