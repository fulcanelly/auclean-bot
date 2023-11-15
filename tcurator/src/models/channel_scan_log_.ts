import { ChannelScanLog, ChannelScanLogInstance, ChannelScanLogProps, ChannelScanLogRelatedNodesI } from "./channel_scan_log"
import { baseInstanceMethods, baseStaticMethods } from "./__base"

export const channelScanLogStaticMethods = {
    ...baseStaticMethods
}
export const channelScanLogInstanceMethods = {
    ...baseInstanceMethods,
    self() {
        return this as any as ChannelScanLogInstance
    }
};