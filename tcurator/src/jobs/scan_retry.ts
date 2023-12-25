
import { iterateQueryBuilder } from "../utils/iterate"
import amqplib from 'amqplib';
import * as R from 'ramda'
import { BindParam, QueryBuilder, QueryRunner } from 'neogma';
import { ChannelScanLog, ChannelScanLogInstance, ChannelScanLogProps } from "../models/channel_scan_log";
import { sentry } from "../sentry";
import { logger } from "../utils/logger";
import { config } from "@/config";
import { defaultSetup } from ".";
import { ChannelScanStatus } from "@/types/channel_scan_status";
import { py_chanscan_request } from "@/types/py_chanscan_request";


declare module '@/config' {
  namespace config {
    interface JobConfigs {
      scan_retry: DefaultModuleSettings & {
        max_attempts: number
        max_timout: number
      }
    }
  }
}

export namespace scan_retry {
  export const setup = (config: config.Config, channel: amqplib.Channel) => {
    const retryConfig = config.jobs.scan_retry

    async function retryBrokenScanRequests(): Promise<boolean> {
      try {
        logger.info('seeking for broken queries')

        const param = new BindParam({
          max_timout: retryConfig.max_timout
        })

        const qb = () => new QueryBuilder(param)
          .match({
            model: ChannelScanLog,
            identifier: 'c'
          })
          .where('(timestamp() - c.enrolled_at) > $max_timout AND c.enrolled_at <> 0 AND c.status IN ["INIT"] AND c.request IS NOT NULL')
          .return('c')


        for await (let queryResult of iterateQueryBuilder(qb, 1)) {

          const result = QueryRunner.getResultProperties<ChannelScanLogProps>(queryResult, 'c')
            .map(it => ChannelScanLog.buildFromRecord({
              properties: it,
              labels: [ChannelScanLog.getLabel()]
            }))
            .map(queueIfSessionAvailable)

          await Promise.all(result)
          if (result.length) {
            return true
          }
        }
      } catch (e) {
        sentry.captureException(e)
        logger.error(e)
      }
      return false
    }


    async function queueIfSessionAvailable(log: ChannelScanLogInstance) {
      try {
        log.attempts = (log.attempts ?? 1) + 1

        if (log.attempts > retryConfig.max_attempts) {
          (log.status as ChannelScanStatus) = 'FAIL'
          return logger.error('Last attempt reached in scan retry, failing scan', log)
        }
      } finally {
        await log.save()
      }

      logger.info('checking is busy')
      const session = await log.getSession()

      if (!session) {
        logger.error('No session');
        (log.status as ChannelScanStatus) = 'FAIL'
        await log.save()
        return
      }
      if (await session.isBussy()) {
        logger.warn('session is bussy, will try later')
        return
      }

      const request: py_chanscan_request = {
        ...JSON.parse(log.request),
        log_id: log.uuid,
      }

      logger.verbose('retrying', {
        queue: 'py:chanscan',
        request
      })

      channel.sendToQueue('py:chanscan', Buffer.from(JSON.stringify(request)))
    }


    defaultSetup(retryBrokenScanRequests, config.jobs.scan_retry, channel)
  }
}
