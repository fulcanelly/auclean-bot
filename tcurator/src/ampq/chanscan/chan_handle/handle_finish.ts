import amqplib from 'amqplib';
import { ChannelScanLog } from '../../../models/channel_scan_log';
import { QueryBuilder, QueryRunner } from 'neogma';
import { neogma } from '../../../neo4j';

import { Session, SessionProps } from '../../../models/session';
import { spy } from '../../../types/spy_packet';
import { logSummary } from '../../../utils/log_summary';

export async function handleFinish(channel: amqplib.Channel, data: spy.Packet) {
	const chanScanLog = await ChannelScanLog.findOne({
		where: {
			uuid: data.log_id
		}
	});
	chanScanLog!.finished_at = Date.now();
	await chanScanLog?.save();

	const queryResult = await new QueryBuilder()
		.match({
			related: [
				{
					model: ChannelScanLog,
					where: {
						uuid: chanScanLog!.uuid
					}
				},
				ChannelScanLog.getRelationshipByAlias('handled_by'),
				{
					model: Session,
					identifier: 's'
				}
			]
		})
		.return('s')
		.run(neogma.queryRunner);

	const session = QueryRunner.getResultProperties<SessionProps>(queryResult, 's');

	const request = {
		scan_summary: await logSummary(chanScanLog!),
		user_id: session[0].user_id
	};

	channel.sendToQueue('tg:login:answer', Buffer.from(JSON.stringify(request)));
}
