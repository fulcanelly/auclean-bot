// GENERATED FILE, MAY CHANGE IN FUTURE, DO NOT EDIT IT MANUALLY
import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma"
import { channelInstanceMethods, channelStaticMethods } from "./channel_"
import { neogen } from "neogen"
import { ChannelScanLog, ChannelScanLogInstance, ChannelScanLogProps, ChannelScanLogRelatedNodesI } from "./channel_scan_log"
import { ChannelPost, ChannelPostInstance, ChannelPostProps, ChannelPostRelatedNodesI } from "./channel_post"
export type ChannelInstance = NeogmaInstance<ChannelProps, ChannelRelatedNodesI, typeof channelInstanceMethods>

export type ChannelProps = {
    name: string | undefined
    channel_link: string
    need_to_scan: boolean
    uuid: string
    channel_id: string
}

export interface ChannelRelatedNodesI {
    scan_logs: ModelRelatedNodesI<typeof ChannelScanLog, ChannelScanLogInstance>
    posts: ModelRelatedNodesI<typeof ChannelPost, ChannelPostInstance>
}

export const Channel = ModelFactory<ChannelProps, ChannelRelatedNodesI, typeof channelStaticMethods, typeof channelInstanceMethods>({
    methods: channelInstanceMethods,
    statics: channelStaticMethods,
    label: "Channel",
    schema: {
        name: { type: ["string", "null"] },
        channel_link: { type: ["string"] },
        need_to_scan: { type: "boolean" },
        uuid: {
            type: "string",
            required: true
        },
        channel_id: { type: "string" }
    },
    primaryKeyField: "uuid"
}, neogen.get())
;