// GENERATED FILE, MAY CHANGE IN FUTURE, DO NOT EDIT IT MANUALLY
import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma"
import { channelScanLogInstanceMethods, channelScanLogStaticMethods } from "./channel_scan_log_"
import { neogen } from "neogen"
import { Channel, ChannelInstance, ChannelProps, ChannelRelatedNodesI } from "./channel"
export type ChannelScanLogInstance = NeogmaInstance<ChannelScanLogProps, ChannelScanLogRelatedNodesI, typeof channelScanLogInstanceMethods>

export type ChannelScanLogProps = {
    uuid: string
    started_at: number
    finished_at: number
}

export interface ChannelScanLogRelatedNodesI {
    of_channel: ModelRelatedNodesI<typeof Channel, ChannelInstance>
}

export const ChannelScanLog = ModelFactory<ChannelScanLogProps, ChannelScanLogRelatedNodesI, typeof channelScanLogStaticMethods, typeof channelScanLogInstanceMethods>({
    methods: channelScanLogInstanceMethods,
    statics: channelScanLogStaticMethods,
    label: "ChannelScanLog",
    schema: {
        uuid: { type: "string" },
        started_at: { type: "number" },
        finished_at: { type: "number" }
    },
    primaryKeyField: "uuid"
}, neogen.get())
;