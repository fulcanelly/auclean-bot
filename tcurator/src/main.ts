import '@/utils/neo4j/log_patch'
import { setupConstraints, setupIndexes } from "./neo4j";
import { sentry } from "./sentry";
import "./models/__relations"
import { setupRmq } from "./rmq";
import { setupScheduledJobs } from "./jobs";
import { logger } from "./utils/logger";


//TODO

//never use QueryRunner.getResultProperties<SessionProps>
/// use =>.record.map(it=recordToObject(it.c))

async function main() {
    try {
        logger.info('starting main')
        await setupConstraints()
        logger.info('constraints setup done')

        await setupIndexes()
        logger.info('indexes setup done')

        const rmq = await setupRmq()
        logger.info('rmq setup done')

        await setupScheduledJobs(rmq)
        logger.info('start jobs')

    } catch (e) {
        logger.error(e)
        sentry.captureException(e)
    }
}

main()
