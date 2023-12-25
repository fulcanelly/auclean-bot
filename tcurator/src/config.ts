import moment, { duration } from "moment"

export namespace config {
  export type Interval = number | moment.Duration

  export function extractDurationFromInterval(i: Interval): moment.Duration {
    if (typeof i == 'number') {
      return duration(i, 'milliseconds')
    } else {
      return i
    }
  }

  export type DefaultModuleSettings = {
    enabled: boolean
    run_at_start: boolean
    interval: Interval
    name: string
  }

  export interface JobConfigs {
  }

  export interface Modules {

  }

  export interface Config {
    jobs: JobConfigs
    modules: Modules
  }

  export const appConfig: config.Config = {
    jobs: {
      scan_retry: {
        enabled: true,
        run_at_start: true,
        interval: 10000,
        name: 'scan retry',
        max_attempts: 10,
        max_timout: 10000
      },
      scan_recursivelly: {
        enabled: false,
        run_at_start: false,
        interval: duration(1, 'minute'),
        name: 'recursive chan scan'
      },
      scan_timout_job: {
        enabled: true,
        run_at_start: true,
        interval: duration(10, 'seconds'),
        max_timeout: duration(3, 'minutes'),
        name: 'find timout jobs',
      },
      regular_channel_scan: {
        enabled: true,
        run_at_start: true,
        interval: duration(10, 'seconds'),
        name: 'regular scan',
        rescan_interval: duration(6, 'hours')
      }
    },
    modules: {
      rmq: {
        prefetch: 50
      },
      sentry: {
        slow_query_trashold: duration(0.5, 'second')
      }
    },
  }
}
