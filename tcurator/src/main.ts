import { Neogma, NeogmaInstance, Op, QueryBuilder, QueryRunner, Where, WhereValuesI } from "neogma";
import { v4 as uuidv4 } from 'uuid';


import { OnlineLog, OnlineLogProps } from "./data/online_log";
import { neogma } from "./neo4j";


import { UserProps, UserRelatedNodesI, Users } from "./data/users";
import "./data/relations";

import amqplib from 'amqplib';
import { tg } from "./data/telegram_session";
import { setupRmq } from "./rmq";


//fetch user info






// createOnlineLog()

async function main() {
    await setupConstraints()
    await setupRmq()
}

main()
// test()
// setTimeout(test, 1000)
