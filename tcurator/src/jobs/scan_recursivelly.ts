import { neogma } from "../neo4j";
import { QueryBuilder, QueryRunner } from "neogma";
import { Channel, ChannelInstance, ChannelProps } from "../models/channel";
import { initFirstScan } from "../services/init_first_scan";
import amqplib from 'amqplib';


export async function scanRecursivellyNewChannels(achannel: amqplib.Channel): Promise<boolean> {
    console.log('seeking for public channels without any scans')
    const channel = await getPublicChannelNeverScanned()

    if (!channel) {
        return false
    }

    console.log('getting channel session')
    const session = await channel.getSessionAddedBy()

    if (!session) {
        return false
    }

    if (await session.isBussy()) {
        return false
    }

    console.log('inititating scan')
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
        .limit(1)
        .run(neogma.queryRunner);

    const channels = QueryRunner.getResultProperties<ChannelProps>(queryResult, 'a')

    if (!channels.length) {
        return
    }

    return Channel.buildFromRecord({
        properties: channels[0],
            labels: [ Channel.getLabel() ]
        })
}
