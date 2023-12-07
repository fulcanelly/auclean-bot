// GENERATED FILE, MAY CHANGE IN FUTURE, DO NOT EDIT IT MANUALLY
import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma"
import { channelSubsInstanceMethods, channelSubsStaticMethods } from "./channel_subs_"
import { neogen } from "neogen"
import { Channel, ChannelInstance, ChannelProps, ChannelRelatedNodesI } from "./channel"
import { ChannelScanLog, ChannelScanLogInstance, ChannelScanLogProps, ChannelScanLogRelatedNodesI } from "./channel_scan_log"
export type ChannelSubsInstance = NeogmaInstance<ChannelSubsProps, ChannelSubsRelatedNodesI, typeof channelSubsInstanceMethods>

export type ChannelSubsProps = {
    count: number
    date: number
    uuid: string
}

export interface ChannelSubsRelatedNodesI {
    of_channel: ModelRelatedNodesI<typeof Channel, ChannelInstance>
    added_by_log: ModelRelatedNodesI<typeof ChannelScanLog, ChannelScanLogInstance>
}

export const ChannelSubs = ModelFactory<ChannelSubsProps, ChannelSubsRelatedNodesI, typeof channelSubsStaticMethods, typeof channelSubsInstanceMethods>({
    methods: channelSubsInstanceMethods,
    statics: channelSubsStaticMethods,
    label: "ChannelSubs",
    schema: {
        count: { type: "number" },
        date: { type: "number" },
        uuid: { type: "string" }
    },
    primaryKeyField: "uuid"
}, neogen.get())
;