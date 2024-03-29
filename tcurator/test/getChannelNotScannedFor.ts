import { Channel, ChannelInstance } from "@/models/channel";
import { ChannelScanLog } from "@/models/channel_scan_log";
import moment from "moment";
import { randUUID } from "./randUUID";
import { relateTo } from '@/utils/neo4j/relateTo';


export const getChannelNotScannedForTests = () => describe('Channel Model - getChannelNotScannedFor method', () => {
  let channel: ChannelInstance;

  const deafultProps = {
    enrolled_at: 0,
    started_at: 0,
    request: "",
    attempts: 0
  }

  beforeEach(async () => {
    channel = await Channel.createOne({
      id: 1,
      need_to_scan: true
    });
  });


  describe('when there are old scan logs in channel', () => {
    beforeEach(async () => {
      // Creating an old scan log related to the channel
      const scanLog = await ChannelScanLog.createOne({
        ...deafultProps,
        uuid: randUUID(),
        status: 'COMPLETED',
        finished_at: moment().subtract(2, 'days').unix()
      })

      await relateTo({
        merge: true,
        from: scanLog,
        alias: 'of_channel',
        target: channel
      })
    });

    it('should return the channel', async () => {
      const timeToCheck = moment.duration(1, 'days');
      const result = await Channel.findNotScannedFor(timeToCheck);
      expect(result).toBeDefined();
      expect(result!.id).toEqual(channel.id);
    });
  });

  describe('when there are recent scan logs in channel', () => {
    beforeEach(async () => {
      const scanLog = await ChannelScanLog.createOne({
        ...deafultProps,
        uuid: randUUID(),
        status: 'COMPLETED',
        finished_at: moment().subtract(10, 'minutes').unix(),
      });

      await relateTo({
        merge: true,
        from: scanLog,
        alias: 'of_channel',
        target: channel,
      })
    });

    it('should not return the channel', async () => {
      const timeToCheck = moment.duration(1, 'days');
      const result = await Channel.findNotScannedFor(timeToCheck);
      expect(result).toBeUndefined();
    });
  });
});

