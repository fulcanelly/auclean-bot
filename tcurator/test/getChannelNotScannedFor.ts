import { Channel, ChannelInstance } from "@/models/channel";
import { ChannelScanLog } from "@/models/channel_scan_log";
import moment from "moment";
import { randUUID } from "./randUUID";


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
      await scanLog.relateTo({
        alias: 'of_channel',
        where: channel.getDataValues()
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
      await scanLog.relateTo({
        alias: 'of_channel',
        where: channel.getDataValues()
      })
    });

    it('should not return the channel', async () => {
      const timeToCheck = moment.duration(1, 'days');
      moment().subtract(moment.duration(1, 'days')).unix()
      const result = await Channel.findNotScannedFor(timeToCheck);
      expect(result).toBeUndefined();
    });
  });

  describe('when conditions match but still having scans in wrong status', () => {
    beforeEach(async () => {
      const promises = [
        ChannelScanLog.createOne({
          ...deafultProps,
          uuid: randUUID(),
          status: 'RUNNING',
          finished_at: moment().subtract(2, 'days').unix()
        }),
        ChannelScanLog.createOne({
          ...deafultProps,
          uuid: randUUID(),
          status: 'COMPLETED',
          finished_at: moment().subtract(10, 'minutes').unix()
        })
      ].map(async scanLog => (await scanLog).relateTo({
        alias: 'of_channel',
        where: channel.getDataValues()
      }))

      await Promise.all(promises)
    });

    it('should not return the channel', async () => {
      const timeToCheck = moment.duration(1, 'days');
      const result = await Channel.findNotScannedFor(timeToCheck);
      expect(result).toBeUndefined();
    });
  });
});

