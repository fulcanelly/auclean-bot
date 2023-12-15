import NodeCache from "node-cache";
import { Channel, ChannelInstance } from "../../../models/channel";
import { cache } from "./cache";

// const cache = new NodeCache({ useClones: false})

let cacges: {[k: string]: Promise<ChannelInstance>} = {}

export async function getChannelById(id: number): Promise<ChannelInstance | undefined> {
    // console.log(cacges)

    const result = cacges[String(id)]

    if (result) {
        console.log('found')
        return result as any
    } else {
        console.log('not found`')
        const channel =  Channel.findOne({
            where: {
                id: id
            }
        })
        debugger

        // cache = cache.set(String(id), channel)
        cacges[String(id)] = channel as any
        return channel as any


        // return channel!
    }

}
