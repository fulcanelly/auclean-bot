import { Neogma } from "neogma";

import * as dotenv from 'dotenv';
import { neogen } from "neogen";
import { logging } from "neo4j-driver";
import { processTransaction } from "./sentry";


function neogmaConfig() {
    const parsed = dotenv.config()?.parsed

    if (process.env.NEO4J_HOST) {
        const conn = {
            url: process.env.NEO4J_HOST,
            username: process.env.NEO4J_USERNAME as string,
            password: process.env.NEO4J_PASSWORD as string,
        }
        console.log(conn)
        return conn
    } else {
        throw new Error('neo4j db not configured')
    }
}

export const neogma = new Neogma(
    neogmaConfig(),
    {
        logger: (q: string) => {
            const [_, query,] = q.split('**')
            processTransaction(query)
            console.log(q)
        },
    },
);


//TODO
// Object.entries(neogma.modelsByName)

neogen.setInstance(neogma)

export async function setupConstraints() {
    let constraints = await neogma.queryRunner.run("SHOW CONSTRAINTS")

    if (!constraints.records.find(record => record.get('name') == 'uniq_user_id')) {
        await neogma.queryRunner.run("CREATE CONSTRAINT uniq_user_id FOR (u:User) REQUIRE u.user_id IS UNIQUE")
    }

}

export async function setupIndexes() {
    const queries = [
        "CREATE CONSTRAINT uniq_channel_id IF NOT EXISTS FOR (u:Channel) REQUIRE u.id IS UNIQUE",
        'CREATE CONSTRAINT uniq_chann_scan_id IF NOT EXISTS FOR (n:ChannelScanLog) REQUIRE n.uuid IS UNIQUE',
        'CREATE CONSTRAINT uniq_post_views_id IF NOT EXISTS FOR (n:PostViews) REQUIRE n.uuid IS UNIQUE',
        'CREATE CONSTRAINT uniq_channel_subs_id IF NOT EXISTS FOR (n:ChannelSubs) REQUIRE n.uuid IS UNIQUE',

        "CREATE CONSTRAINT uniq_channel_post_id IF NOT EXISTS FOR (u:ChannelPost) REQUIRE (u.id, u.channel_id) IS UNIQUE",
        "CREATE CONSTRAINT uniq_user_id IF NOT EXISTS FOR (u:User) REQUIRE u.user_id IS UNIQUE",
        'CREATE TEXT INDEX online_log_uuid_index IF NOT EXISTS FOR (n:OnlineLog) ON (n.uuid)',
        'CREATE TEXT INDEX user_id_index IF NOT EXISTS FOR (n:User) ON (n.user_id)',

    ]

    for await (const query of queries) {
        await neogma.queryRunner.run(query)
    }
}
