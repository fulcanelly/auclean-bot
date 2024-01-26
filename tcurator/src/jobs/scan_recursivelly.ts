import { neogma } from "../neo4j";
import { QueryBuilder, QueryRunner } from "neogma";
import { Channel, ChannelInstance, ChannelProps } from "../models/channel";
import { initFirstScan } from "../services/init_first_scan";
import amqplib from 'amqplib';
import { logger } from "../utils/logger";
import { config } from "../config";
import { defaultSetup } from ".";
import { getQueryResult } from "@/utils/neo4j/getQueryResult";
import * as R from 'ramda'
import { queires } from "@/queries/all";
import { recordToObject } from "@/utils/neo4j/record_to_object";
import { initRecentScan } from "@/services/init_recent_scan";

type strategyType = 'basic' | 'least_referenced'

declare module "../config" {
    namespace config {
        interface JobConfigs {
            scan_recursivelly: DefaultModuleSettings & {
                strategy: strategyType
            }
        }
    }
}

export namespace scan_rec {

    export const getRunner = (config: config.Config) => {
        const strategy = config.jobs.scan_recursivelly.strategy
        if (strategy == 'basic') {
            return scanRecursivellyNewChannelsBasic
        } else if (strategy == 'least_referenced') {
            return scanLeastReferencedNeverScannedPublicChannel
        }
        throw 'can\'t find runner'
    }

    export const setup = (config: config.Config, achannel: amqplib.Channel) =>
        defaultSetup(getRunner(config), config.jobs.scan_recursivelly, achannel)
}


async function scanLeastReferencedNeverScannedPublicChannel(achannel: amqplib.Channel) {
    const channel = await getLeastReferencedNeverScannedPublicChannel()

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

    await initRecentScan(channel, session, achannel)
    return true
}


async function scanRecursivellyNewChannelsBasic(achannel: amqplib.Channel): Promise<boolean> {
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

async function checkIsReady() { }

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

async function getLeastReferencedNeverScannedPublicChannel(): Promise<ChannelInstance | undefined> {
    const result = await new QueryBuilder()
        .raw(await queires.leastReferencedNeverScannedPublicChannel())
        .run(neogma.queryRunner)

    return result.records.map(recordToObject)
        .map(it => it.a)
        .map(Channel.buildFromRecord)[0]
}
