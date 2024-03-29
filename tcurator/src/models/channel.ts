// GENERATED FILE, MAY CHANGE IN FUTURE, DO NOT EDIT IT MANUALLY
import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma"
import { channelInstanceMethods, channelStaticMethods } from "./channel_"
import { neogen } from "neogen"
import { ChannelScanLog, ChannelScanLogInstance, ChannelScanLogProps, ChannelScanLogRelatedNodesI } from "./channel_scan_log"
import { ChannelPost, ChannelPostInstance, ChannelPostProps, ChannelPostRelatedNodesI } from "./channel_post"
import { ChannelSubs, ChannelSubsInstance, ChannelSubsProps, ChannelSubsRelatedNodesI } from "./channel_subs"
export type ChannelInstance = NeogmaInstance<ChannelProps, ChannelRelatedNodesI, typeof channelInstanceMethods>

export type ChannelProps = {
    id: number
    is_public?: boolean | undefined
    title?: string | undefined
    username?: string | undefined
    created_at?: number | undefined
    channel_link?: string | undefined
    need_to_scan: boolean
}

export interface ChannelRelatedNodesI {
    scan_logs: ModelRelatedNodesI<typeof ChannelScanLog, ChannelScanLogInstance>
    posts: ModelRelatedNodesI<typeof ChannelPost, ChannelPostInstance>
    subs_history: ModelRelatedNodesI<typeof ChannelSubs, ChannelSubsInstance>
    added_by_log: ModelRelatedNodesI<typeof ChannelScanLog, ChannelScanLogInstance>
}

export const Channel = ModelFactory<ChannelProps, ChannelRelatedNodesI, typeof channelStaticMethods, typeof channelInstanceMethods>({
    methods: channelInstanceMethods,
    statics: channelStaticMethods,
    label: "Channel",
    schema: {
        id: { type: "number" },
        is_public: { type: ["boolean", "null"] },
        title: { type: ["string", "null"] },
        username: { type: ["string", "null"] },
        created_at: { type: ["number", "null"] },
        channel_link: { type: ["string", "null"] },
        need_to_scan: { type: "boolean" }
    },
    primaryKeyField: "id"
}, neogen.get())
;