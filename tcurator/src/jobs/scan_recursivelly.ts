import { neogma } from "../neo4j";
import { QueryBuilder, QueryRunner } from "neogma";
import { Channel, ChannelInstance, ChannelProps } from "../models/channel";
import { initFirstScan } from "../services/init_first_scan";
import amqplib from 'amqplib';
import { logger } from "../utils/logger";
import { config } from "../config";
import { defaultSetup } from ".";
import { getQueryResult } from "@/utils/neo4j/getQueryResult";

declare module "../config" {
    namespace config {
        interface JobConfigs {
            scan_recursivelly: DefaultModuleSettings
        }
    }
}

export namespace scan_rec {
    export const setup = (config: config.Config, achannel: amqplib.Channel) =>
        defaultSetup(scanRecursivellyNewChannels, config.jobs.scan_recursivelly, achannel)
}


export async function scanRecursivellyNewChannels(achannel: amqplib.Channel): Promise<boolean> {
    logger.info('seeking for public channels without any scans')
    const channel = await getPublicChannelNeverScanned()

    if (!channel) {
        logger.warn('can\'t find any')
        return false
    }

    logger.info('getting channel session')
    const session = await channel.getSessionAddedBy()

    if (!session) {
        logger.warn('no session related to channel', channel.dataValues)
        return false
    }

    if (await session.isBussy()) {
        logger.warn('session is bussy')
        return false
    }

    logger.info('inititating scan')
    await initFirstScan(achannel, session, channel.username!)
    return true
}

async function getPublicChannelNeverScanned(): Promise<ChannelInstance | undefined> {
    const queryResult = await new QueryBuilder()
        .match({
            identifier: 'a',
            model: Channel
        })
        .where('NOT (a)-[:SCANNED_FOR]-(:ChannelScanLog) AND a.username IS NOT NULL')
        .return('a')
        .raw('ORDER BY RAND()')
        .limit(1)
        .run(neogma.queryRunner);

    return getQueryResult(queryResult, Channel, 'a')[0]
}
