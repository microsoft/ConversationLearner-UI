/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export interface Deferred {
    resolve: Function
    reject: Function
}

export interface ActivePoll {
    id: string
    end: number
    deferred: Deferred[]
}

export interface IPollConfig<T> {
    id: string
    interval: number
    maxDuration: number
    request: () => Promise<T>
    isResolved: (t: T) => boolean
    onExpired: () => void
    onUpdate: (t: T) => void
}

export class Poller {
    private polls: ActivePoll[] = []

    poll<T>(pollConfig: IPollConfig<T>) {
        const { id, maxDuration } = pollConfig
        const start = new Date().getTime()
        const end = start + maxDuration
        const activeApp = this.polls.find(p => p.id === id)

        if (activeApp) {
            console.log(`Existing app polling found for id: ${id} increasing end from ${activeApp.end} to: ${end}`)
            activeApp.end = end
            const promise = new Promise((resolve, reject) => {
                activeApp.deferred.push({ resolve, reject })
            })

            return promise
        }

        console.log(`No app polling found for id: ${id}. Starting new polling until: ${end}`)
        const promise = new Promise((resolve, reject) => {
            this.polls.push({
                id,
                end,
                deferred: [{ resolve, reject }]
            })
        })

        this.startPoll(pollConfig)

        return promise
    }

    private startPoll<T>(pollConfig: IPollConfig<T>) {
        setTimeout(async () => {
            const now = (new Date()).getTime()
            // Alternate approach is to split this into three phases: Filter those expired, await all requests, then filter all resolved.
            this.polls = (await Promise.all(this.polls.map(async poll => {
                const { end } = poll
                // If current time is after max allowed polling duration then resolve
                if (now >= end) {
                    pollConfig.onExpired()
                    poll.deferred.forEach(deferred => deferred.resolve())
                    return undefined
                }

                // Get training status and if it's one of the resolved states resolve promise
                const result = await pollConfig.request()
                pollConfig.onUpdate(result)

                // If trainings status is one of resolved states, remove app from polls to discontinue
                if (pollConfig.isResolved(result)) {
                    poll.deferred.forEach(deferred => deferred.resolve())
                    return undefined
                }

                return poll
            }))).filter(x => x)

            if (this.polls.length > 0) {
                this.startPoll(pollConfig)
            }
        }, pollConfig.interval)
    }
}