import { config } from '@/config';
import * as Sentry from '@sentry/node';

Sentry.init({
  environment: 'production',
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
})

declare module "./config" {
  namespace config {
    interface Modules {
      sentry: {
        slow_query_trashold: Interval
      }
    }
  }
}

export function processTransaction(query: Object, queryDurationMs: number, params: any) {
  const transaction = Sentry.startTransaction({
    op: "transaction",
    name: "CHYPER",
  });

  transaction.setContext('query', { query, queryDurationMs })

  const trashold = config.extractDurationFromInterval(config.appConfig.modules.sentry.slow_query_trashold)
    .milliseconds()

  if (queryDurationMs > trashold ) {
    Sentry.captureMessage(`Slow query: ${JSON.stringify(query)}`, {
      level: 'error',
      extra: {
        query,
        queryDurationMs,
        params,
      },
    });
    transaction.setStatus('failure');
  } else {
    transaction.setStatus("ok");
  }

  transaction.finish();
}


export const sentry = Sentry
