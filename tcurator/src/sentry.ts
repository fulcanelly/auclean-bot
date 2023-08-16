import * as Sentry from '@sentry/node';


console.log({
    aaaa:  process.env.SENTRY_DSN
})

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
})

export const sentry = Sentry
