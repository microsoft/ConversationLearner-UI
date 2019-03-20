/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as util from '../Utils/util'

export interface Deferred {
    resolve: Function
    reject: Function
    pollConfig: IPollConfig<any>
}

export interface ActivePoll {
    id: string
    end: number
    deferred: Deferred[]
}

export interface IPollConfig<T> {
    id: string
    maxDuration: number
    request: () => Promise<T>
    isResolved: (t: T) => boolean
    onExpired: () => void
    onUpdate: (t: T) => void
}

export interface IPollerOptions {
    interval: number
}

const global = window
export class Poller {
    // Need some random character for visual difference in logs. Could use uuid() library but don't want dependency
    private id = Symbol(Math.floor(Math.random() * 100))
    private polls: ActivePoll[] = []
    constructor(options: IPollerOptions) {
        global.setInterval(async () => await this.poll(), options.interval)
    }

    addPoll<T>(pollConfig: IPollConfig<T>) {
        const { id, maxDuration } = pollConfig
        const start = new Date().getTime()
        const end = start + maxDuration
        const activeApp = this.polls.find(p => p.id === id)

        if (activeApp) {
            // console.log(`Poller: ${this.id.toString()} - Existing polling found for id: ${id} increasing end from ${activeApp.end} to: ${end}`)
            activeApp.end = end
            return new Promise((resolve, reject) => {
                activeApp.deferred.push({ resolve, reject, pollConfig })
            })
        }

        // console.log(`Poller: ${this.id.toString()} - No polling found for id: ${id}. Starting new polling until: ${end}`)
        return new Promise((resolve, reject) => {
            this.polls.push({
                id,
                end,
                deferred: [{ resolve, reject, pollConfig }]
            })
        })
    }

    removePoll(pollId: string) {
        this.polls = this.polls.filter(p => p.id !== pollId)
    }

    private async poll() {
        const now = (new Date()).getTime()
        // Alternate approach is to split this into three phases: Filter those expired, await all requests, then filter all resolved.
        this.polls = (await Promise.all(this.polls.map(async poll => {
            const { end } = poll
            // If current time is after max allowed polling duration then resolve
            if (now >= end) {
                poll.deferred.forEach(deferred => {
                    deferred.pollConfig.onExpired()
                    deferred.resolve()
                })
                return undefined
            }

            // Get training status and if it's one of the resolved states resolve promise
            const firstConfig = poll.deferred[0].pollConfig
            const result = await firstConfig.request()
            firstConfig.onUpdate(result)

            // If trainings status is one of resolved states, remove app from polls to discontinue
            if (firstConfig.isResolved(result)) {
                poll.deferred.forEach(deferred => deferred.resolve())
                return undefined
            }

            return poll
        }))).filter(util.notNullOrUndefined)
    }
}