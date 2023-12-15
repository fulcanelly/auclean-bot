// GENERATED FILE, MAY CHANGE IN FUTURE, DO NOT EDIT IT MANUALLY
import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma"
import { channelScanLogInstanceMethods, channelScanLogStaticMethods } from "./channel_scan_log_"
import { neogen } from "neogen"
import { Channel, ChannelInstance, ChannelProps, ChannelRelatedNodesI } from "./channel"
import { Session, SessionInstance, SessionProps, SessionRelatedNodesI } from "./session"
export type ChannelScanLogInstance = NeogmaInstance<ChannelScanLogProps, ChannelScanLogRelatedNodesI, typeof channelScanLogInstanceMethods>

export type ChannelScanLogProps = {
    uuid: string
    enrolled_at: number
    started_at: number
    finished_at: number
    request: string
    status: string
}

export interface ChannelScanLogRelatedNodesI {
    of_channel: ModelRelatedNodesI<typeof Channel, ChannelInstance>
    handled_by: ModelRelatedNodesI<typeof Session, SessionInstance>
}

export const ChannelScanLog = ModelFactory<ChannelScanLogProps, ChannelScanLogRelatedNodesI, typeof channelScanLogStaticMethods, typeof channelScanLogInstanceMethods>({
    methods: channelScanLogInstanceMethods,
    statics: channelScanLogStaticMethods,
    label: "ChannelScanLog",
    schema: {
        uuid: { type: "string" },
        enrolled_at: { type: "number" },
        started_at: { type: "number" },
        finished_at: { type: "number" },
        request: { type: "string" },
        status: { type: "string" }
    },
    primaryKeyField: "uuid"
}, neogen.get())
;