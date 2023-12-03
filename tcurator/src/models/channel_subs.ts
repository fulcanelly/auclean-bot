// GENERATED FILE, MAY CHANGE IN FUTURE, DO NOT EDIT IT MANUALLY
import { ModelFactory, ModelRelatedNodesI, NeogmaInstance } from "neogma"
import { channelSubsInstanceMethods, channelSubsStaticMethods } from "./channel_subs_"
import { neogen } from "neogen"
import { Channel, ChannelInstance, ChannelProps, ChannelRelatedNodesI } from "./channel"
export type ChannelSubsInstance = NeogmaInstance<ChannelSubsProps, ChannelSubsRelatedNodesI, typeof channelSubsInstanceMethods>

export type ChannelSubsProps = {
    count: number
    date: number
    uuid: string
}

export interface ChannelSubsRelatedNodesI {
    of_channel: ModelRelatedNodesI<typeof Channel, ChannelInstance>
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