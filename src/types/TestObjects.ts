/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as Util from '../Utils/util'
import * as BB from 'botbuilder'
import * as OBIUtils from '../Utils/obiUtils'

export enum ValidationRatingType {
    BEST = 'BEST',
    BETTER = 'BETTER',
    SAME = 'SAME',
    WORSE = 'WORSE',
    WORST = 'WORST',
    UNKNOWN = 'UNKNOWN'
}

export enum ComparisonResultType {
    ALL = 'ALL',
    REPRODUCED = 'REPRODUCED',
    CHANGED = 'CHANGED',
    INVALID_TRANSCRIPT = 'INVALID_TRANSCRIPT',
    NO_TRANSCRIPT = 'NOTRANSCRIPT'
    //LARS test failed
}

export interface ValidationItem {
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
    sourceNames: [string, string] 
    result: RatingResult 
}

export class ValidationSet {
    appId?: string
    fileName?: string
    items: ValidationItem[]
    comparisons: SourceComparison[]
    ratingPairs: RatingPair[]
    sourceNames: string[]

    public constructor(init?: Partial<ValidationSet>) {
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
    }

    // Returns number of unique conversationIds included in set
    // Could be different for each source
    numConversations(): number {
        const conversationIds = this.items.map(i => i.conversationId)
        return [...new Set(conversationIds)].length
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

    getItem(sourceName: string, conversationId: string): ValidationItem | undefined {
        return this.items
            .find(i => i.sourceName === sourceName
                && conversationId === i.conversationId)
    }

    getItems(sourceName: string, conversationIds: string[]): ValidationItem[] {
        return this.items
            .filter(i => i.sourceName === sourceName
                && conversationIds.includes(i.conversationId))
    }

    getAllConversationIds(): string[] {
        const conversationIds = this.items.map(i => i.conversationId)
        return [...new Set(conversationIds)]
    }

    // Returns conversationIds for the given source and result type
    getConversationIds(sourceName: string, resultType: ComparisonResultType): string[] {
        return this.comparisons
            .filter(c => c.result === resultType  // LARS handle all
                && c.sourceNames.includes(sourceName))
            .map(c => c.conversationId)
    }

    async addTranscriptFiles(transcriptFiles: File[]): Promise<void> {
        for (const file of transcriptFiles) {
            let fileContent = await Util.readFileAsync(file)
            try {
                const transcript: BB.Activity[] = JSON.parse(fileContent)
                const sourceName = this.sourceName(transcript)
                const conversationId = this.conversationId(transcript)

                const item: ValidationItem = { 
                    sourceName: sourceName,
                    conversationId,
                    logDialogId: null, 
                    ranking: undefined,
                    transcript
                }

                this.addValidationResult(item)

                // Add sourceName if it doesn't exist
                if (!this.sourceNames.includes(sourceName)) {
                    this.sourceNames.push(sourceName)
                }
            }
            catch (e) {
            //    const error = e as Error
            //LARS    this.props.setErrorDisplay(ErrorType.Error, `.transcript file (${transcriptFile.name})`, error.message, null)
            }
        }
    }

    addValidationResult(item: ValidationItem): void {
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
        }
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
    }

    compareAll() {

        // Delete any existing comparisons
        this.comparisons = []

        // Now test each transcript against every other
        for (const outerSource of this.sourceNames) {

            const outerTranscripts = this.getTranscripts(outerSource)

            // For each source
            for (const innerSource of this.sourceNames) {

                // Don't compare to self
                if (innerSource !== outerSource) {

                    // Get existing comparisons between these two
                    const comparisons  = this.getSourceComparisons(innerSource, outerSource)

                    // For each transcript
                    for (const outerTranscript of outerTranscripts) {

                        const conversationId = this.conversationId(outerTranscript)

                        // Only need to comparision in one direction
                        if (!comparisons.find(c => c.conversationId === conversationId)) {
                                
                            // Find the matching transcript
                            let item = this.items.find(i => i.sourceName === innerSource && i.conversationId === conversationId)

                            // If no item 
                            if (!item || !item.transcript) {
                                this.comparisons.push({ 
                                    conversationId,
                                    sourceNames: [innerSource, outerSource],
                                    result: ComparisonResultType.NO_TRANSCRIPT
                                })
                            }
                            else {
                                const result = OBIUtils.areTranscriptsEqual(outerTranscript, item.transcript)
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

                    // Order by source alphabetically
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

        // Return count of those haven't been rated
        return this.ratingPairs.filter(rp => rp.result === RatingResult.UNKNOWN).length
    }

    // Converts pairwise ratings between transcripts to a ranking between all (>2 transcripts)
    calcRankings(): void {

        for (const item of this.items) {
            // Get ratingpairs for this item
            const ratingParis = this.ratingPairs.filter(c => c.conversationId === item.conversationId)

            // Clear any old ranking
            item.ranking = undefined
            
            // Give a point for each time it was voted as better
            for (const ratingPair of ratingParis) {
                if (ratingPair.result === RatingResult.FIRST && ratingPair.sourceNames[0] === item.sourceName) {
                    item.ranking = item.ranking ? item.ranking + 1 : 1
                }
                else if (ratingPair.result === RatingResult.SECOND && ratingPair.sourceNames[1] === item.sourceName) {
                    item.ranking = item.ranking ? item.ranking + 1 : 1
                }
                else {
                    item.ranking = item.ranking || 0
                }
            }
        }
    }

    // Return a random pair of sources needing to be compared
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
}