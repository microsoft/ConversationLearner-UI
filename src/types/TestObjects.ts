/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as Util from '../Utils/util'
import * as BB from 'botbuilder'
import * as OBIUtils from '../Utils/obiUtils'
import * as CLM from '@conversationlearner/models'

export enum ComparisonResultType {
    ALL = 'ALL',
    REPRODUCED = 'REPRODUCED',
    CHANGED = 'CHANGED',
    INVALID_TRANSCRIPT = 'INVALID_TRANSCRIPT',
    NO_TRANSCRIPT = 'NOTRANSCRIPT'
}

export interface TestItem {
    sourceName: string
    conversationId: string
    transcript?: BB.Activity[]
    ranking?: number
    logDialogId: string | null
    invalidTranscript?: boolean
}

export interface SourceComparison {
    conversationId: string
    sourceNames: [string, string] 
    result: ComparisonResultType
}

export enum RatingResult {
    FIRST = 'FIRST',
    SECOND = 'SECOND',
    SAME = 'SAME',
    UNKNOWN = 'UNKNOWN',
    NO_TRANSCRIPT = 'NO_TRANSCRIPT'
}
export interface RatingPair {
    conversationId: string
    // Source names in alphabetical order
    sourceNames: [string, string] 
    result: RatingResult 
}

export class TestSet {
    appId?: string
    fileName?: string
    items: TestItem[]
    sourceNames: string[]
    ratingPairs: RatingPair[]
    lgItems: CLM.LGItem[]    
    usesLgMap: Map<string, boolean>   // <sourceName, does it use  LG>

    private comparisons: SourceComparison[]
    
    static Create(source?: Partial<TestSet>): TestSet {
        let init = Util.deepCopy(source)
        return new TestSet(init)
    }

    static Deserialize(fileText: string): TestSet {

        const set = JSON.parse(fileText, Util.mapReviver)
        const testSet = this.Create(set)

        if (testSet.items.length === 0) {
            throw new Error("No test results found in file")
        }
        /* TODO: Allow for now. 
        if (testSet.appId !== this.props.app.appId) {
            throw new Error("Loaded results are from a different Model")
        }*/

        return testSet
    }

    // Create blob for saving
    serialize(): Blob {
        return new Blob([JSON.stringify(this, Util.mapReplacer)], { type: "text/plain;charset=utf-8" })
    }

    // Returns number of unique conversationIds included in set
    // Could be different for each source
    numConversations(): number {
        const conversationIds = this.items.map(i => i.conversationId)
        return [...new Set(conversationIds)].length
    }

    // Returns true if any of the sources use LG refs
    usesLG(): boolean {
        let temp = Array.from(this.usesLgMap.values()).find(v => v)
        return temp || false
    }

    getTranscripts(sourceName: string): BB.Activity[][] {
        return this.items
            .filter(i => i.sourceName === sourceName)
            .map(i => i.transcript)
            .filter(i => i !== undefined) as BB.Activity[][]    
    }

    getTranscript(sourceName: string, conversationId: string): BB.Activity[] | undefined {
        const item = this.items
            .find(i => i.sourceName === sourceName && i.conversationId === conversationId)

        return item ? item.transcript : undefined
    }

    getTestItem(sourceName: string, conversationId: string): TestItem | undefined {
        return this.items
            .find(i => i.sourceName === sourceName
                && conversationId === i.conversationId)
    }

    getTestItems(sourceName: string, conversationIds?: string[]): TestItem[] {
        return this.items
            .filter(i => i.sourceName === sourceName
                && (!conversationIds || conversationIds.includes(i.conversationId)))
    }

    getAllConversationIds(): string[] {
        const conversationIds = this.items.map(i => i.conversationId)
        return [...new Set(conversationIds)]
    }

    // Returns conversationIds for the given comparison params
    getComparisonConversationIds(pivotName: string, sourceName: string, resultType: ComparisonResultType): string[] {
        return this.comparisons
            .filter(c => c.result === resultType
                && c.sourceNames.includes(pivotName)
                && c.sourceNames.includes(sourceName))
            .map(c => c.conversationId)
    }

    async addLGFiles(lgFiles: File[]): Promise<void> {
        this.lgItems = await OBIUtils.lgMapFromLGFiles(lgFiles, this.lgItems)
    }

    async addTranscriptFiles(transcriptFiles: File[]): Promise<void> {
        for (const file of transcriptFiles) {
            let fileContent = await Util.readFileAsync(file)

            const transcript: BB.Activity[] = JSON.parse(fileContent)
            let transcriptUsesLG = OBIUtils.usesLG(transcript)
            const sourceName = this.sourceName(transcript)
            const conversationId = this.conversationId(transcript)

            const item: TestItem = { 
                sourceName: sourceName,
                conversationId,
                logDialogId: null, 
                ranking: undefined,
                transcript
            }

            this.addTestItem(item)

            if (transcriptUsesLG) {
                this.usesLgMap.set(sourceName, transcriptUsesLG)
            }

            // Add sourceName if it doesn't exist
            if (!this.sourceNames.includes(sourceName)) {
                this.sourceNames.push(sourceName)
                this.sourceNames.sort()
            }
        }
    }

    addTestItem(item: TestItem): void {
        // Check that is a valid transcript
        if (!item.transcript || item.transcript.length === 0) {
            throw new Error("Transcript has no rounds")
        }
        if (!item.transcript[0].conversation || !item.transcript[0].conversation.id) {
            throw new Error("Transcript does not have a conversationId")
        }

        // Remove existing item (if it exists)
        this.items = this.items.filter(i =>
            !(i.conversationId === item.conversationId && i.sourceName === item.sourceName))

        // Add new one
        this.items.push(item)

        // Add sourceName if it doesn't exist
        if (!this.sourceNames.includes(item.sourceName)) {
            this.sourceNames.push(item.sourceName)
            this.sourceNames.sort()
        }
    }

    compareAll() {

        // Delete any existing comparisons
        this.comparisons = []

        // Now test each transcript against every other
        for (const outerSource of this.sourceNames) {

            // For each source
            for (const innerSource of this.sourceNames) {

                // Don't compare to self
                if (innerSource !== outerSource) {

                    // Get existing comparisons between these two
                    const comparisons  = this.getSourceComparisons(innerSource, outerSource)

                    // Loop through all conversations
                    const allConversationIds = this.getAllConversationIds()
                    for (const conversationId of allConversationIds) {

                        // May have already done the comparison in the opposite direction
                        if (!comparisons.find(c => c.conversationId === conversationId)) {

                            // Find the matching transcripts
                            let innerItem = this.items.find(i => i.sourceName === innerSource && i.conversationId === conversationId)
                            let outerItem = this.items.find(i => i.sourceName === outerSource && i.conversationId === conversationId)

                            // If either has no transcript
                            if (!innerItem || !innerItem.transcript || !outerItem || !outerItem.transcript) {
                                this.comparisons.push({ 
                                    conversationId,
                                    sourceNames: [innerSource, outerSource],
                                    result: ComparisonResultType.NO_TRANSCRIPT
                                })
                            }
                            else {
                                const result = OBIUtils.areTranscriptsEqual(innerItem.transcript, outerItem.transcript, true)
                                    ? ComparisonResultType.REPRODUCED 
                                    : ComparisonResultType.CHANGED

                                this.comparisons.push({ 
                                    conversationId,
                                    sourceNames: [innerSource, outerSource],
                                    result
                                })
                            }
                        }
                    }
                }
            }
        }
    }

    // Initialize slots used for rating transcripts
    // Return number of ratings needed
    initRating(): number {

        const possiblePairs: RatingPair[] = []

        // Itterate through all possible pairwise combinations
        for (const outerSource of this.sourceNames) {
            for (const innerSource of this.sourceNames) {

                // Don't compare to self
                if (innerSource !== outerSource) {

                    // Lookup is always alphabetical
                    const sourceNames = [outerSource, innerSource].sort()

                    // Add new pair if it doesn't already exits
                    if (!possiblePairs.find(p => p.sourceNames[0] === sourceNames[0] && p.sourceNames[1] === sourceNames[1])) {
                        possiblePairs.push({conversationId: '', sourceNames: [sourceNames[0], sourceNames[1]], result: RatingResult.UNKNOWN})
                    }
                }
            }
        }

        // Now create RatingPairs for each conversationId
        this.ratingPairs = []
        const conversationIds = this.getAllConversationIds()
        for (const conversationId of conversationIds) {
            const newPairs = Util.deepCopy(possiblePairs)
            for (const ratingPair of newPairs) {
                ratingPair.conversationId = conversationId
            }
            this.ratingPairs = this.ratingPairs.concat(newPairs)
        }

        // Ratings can be set automatically if transcripts are matched or transcript is missing / invalid
        for (const ratingPair of this.ratingPairs) {
            const comparison = this.getSourceComparisons(ratingPair.sourceNames[0], ratingPair.sourceNames[1])
                .find(c => c.conversationId === ratingPair.conversationId)
            if (comparison) {
                if (comparison.result === ComparisonResultType.REPRODUCED) {
                    ratingPair.result = RatingResult.SAME
                }
                else if (comparison.result === ComparisonResultType.NO_TRANSCRIPT
                    || comparison.result === ComparisonResultType.INVALID_TRANSCRIPT) {
                    ratingPair.result = RatingResult.NO_TRANSCRIPT
                }
            }
        }

        // Calculate initial rankings
        this.calcRankings()

        // Return count of those haven't been rated
        return this.ratingPairs.filter(rp => rp.result === RatingResult.UNKNOWN).length
    }

    numRatingsNeeded(): number {
        return this.ratingPairs.filter(rp => rp.result === RatingResult.UNKNOWN).length
    }
    
    getRating(pivotSource: string, source: string, conversationId: string): RatingResult {
        // Lookup is always alphabetical
        const sourceNames = [pivotSource, source].sort()
        const ratingPair = this.ratingPairs.find(rp => 
            rp.conversationId === conversationId
            && rp.sourceNames[0] === sourceNames[0]
            && rp.sourceNames[1] === sourceNames[1]) 
        return ratingPair ? ratingPair.result : RatingResult.UNKNOWN
    }

    // Add a rating pair result
    addRatingResult(ratingPair: RatingPair) {
        // Remove existing rating
        this.ratingPairs = this.ratingPairs.filter(rp =>
            !(rp.conversationId === ratingPair.conversationId &&
            rp.sourceNames[0] === ratingPair.sourceNames[0] &&
            rp.sourceNames[1] === ratingPair.sourceNames[1]))

        // Add new one
        this.ratingPairs.push(ratingPair)
/*
        // Check if other sources share the same transcript
        // If so we can set that rating too
        const sameAsSource0 = this.ratingPairs
                .filter(rp => 
                    rp.conversationId === ratingPair.conversationId
                    && rp.sourceNames.includes[ratingPair.sourceNames[0]]
                    && !rp.sourceNames.includes[ratingPair.sourceNames[1]]
                    && rp.result === RatingResult.SAME)
                .map(rp => rp.sourceNames[1])

        const sameAsSource1 = this.ratingPairs
            .filter(rp => 
                rp.conversationId === ratingPair.conversationId
                && rp.sourceNames.includes[ratingPair.sourceNames[1]]
                && !rp.sourceNames.includes[ratingPair.sourceNames[0]]
                && rp.result === RatingResult.SAME)
            .map(rp => rp.sourceNames[0])

        // if A=B and A=C then B=C)
        sameAsSource0.
*/
    }
        
    // Converts pairwise ratings between transcripts to a ranking between all (>2 transcripts)
    calcRankings(): void {

        for (const item of this.items) {
            // Get ratingpairs for this item
            const ratingPairs = this.ratingPairs.filter(c => c.conversationId === item.conversationId)

            // Clear any old ranking
            item.ranking = 0
            
            // Give a point for each time it was voted as better
            for (const ratingPair of ratingPairs) {
                if (ratingPair.result === RatingResult.FIRST && ratingPair.sourceNames[0] === item.sourceName) {
                    item.ranking = item.ranking ? item.ranking + 1 : 1
                }
                else if (ratingPair.result === RatingResult.SECOND && ratingPair.sourceNames[1] === item.sourceName) {
                    item.ranking = item.ranking ? item.ranking + 1 : 1
                }
            }
        }
    }

    // Return count of unratable items because there are
    // no matching transcripts between the two sources
    unratableConversationIds(source: string, pivotSource?: string): string[] {
        const filterConversationIds = pivotSource 
            ? this.items.filter(i => i.sourceName === pivotSource).map(i => i.conversationId)
            : this.getAllConversationIds()
            
        const conversationIds = this.items.filter(i => i.sourceName === source).map(i => i.conversationId)
        return filterConversationIds.filter(id => !conversationIds.includes(id))
    }

    // Return list of conversationIds that haven't been rated yet
    unratedConversationIds(source: string, filterSource?: string): string[] {

        // Get list of conversations that exist for both
        const filterConversationIds = filterSource 
            ? this.items.filter(i => i.sourceName === filterSource).map(i => i.conversationId)
            : this.getAllConversationIds()

        const sourceConversationIds = this.items.filter(i => i.sourceName === source).map(i => i.conversationId)
        const sharedConversationIds = filterConversationIds.filter(id => sourceConversationIds.includes(id))
        
        // Lookup is always alphabetical
        const sourceNames = [filterSource, source].sort()

        // Find ones that still need to be rated
        return this.ratingPairs.filter(rp => 
                rp.result === RatingResult.UNKNOWN
                && ((filterSource === undefined && rp.sourceNames.includes(source))
                    || (rp.sourceNames[0] === sourceNames[0] && rp.sourceNames[1] === sourceNames[1]))
                && sharedConversationIds.includes(rp.conversationId))
                .map(rp => rp.conversationId)
    }

    // Return a random pair of sources needing to be rated
    getNeededRating(): RatingPair | undefined {

        // Filter to only those that haven't been rated
        const neededPairs = this.ratingPairs.filter(rp => rp.result === RatingResult.UNKNOWN)

        if (neededPairs.length === 0) {
            return undefined
        }

        // Pick one at random.  Return a copy
        const index = Util.randomInt(0, neededPairs.length - 1)
        return Util.deepCopy(neededPairs[index])
    }

    getSourceComparisons(sourceName1: string, sourceName2: string): SourceComparison[] {
        return this.comparisons.filter(c =>
            c.sourceNames.includes(sourceName1) &&
            c.sourceNames.includes(sourceName2))
    }

    // Get conversation Id from a transcript
    conversationId(transcript: BB.Activity[]): string {
        if (transcript.length === 0 || !transcript[0].conversation || !transcript[0].conversation.id) {
            throw new Error("Transcript does not have a conversationId")
        }
        return transcript[0].conversation.id
    }

    // Get sourceName for a transcript
    sourceName(transcript: BB.Activity[]): string {
        if (transcript.length === 0 || !transcript[0].channelId) {
            throw new Error("Transcript does not have a channelId")
        }
        return transcript[0].channelId
    }

    private constructor(init?: Partial<TestSet>) {
        Object.assign(this, init)
        if (!this.sourceNames) {
            this.sourceNames = []
        }
        if (!this.items) {
            this.items = []
        }
        if (!this.comparisons) {
            this.comparisons = []
        }
        if (!this.ratingPairs) {
            this.ratingPairs = []
        }
        if (!this.lgItems) {
            this.lgItems = []
        }
        if (!this.usesLgMap) {
            this.usesLgMap = new Map<string, boolean>()
        }
    }
}