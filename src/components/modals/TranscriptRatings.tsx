/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import * as Test from '../../types/TestObjects'
import { connect } from 'react-redux'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../../react-intl-messages'
import { autobind } from 'core-decorators'
import '../../routes/Apps/App/Testing.css'
import './TranscriptRatings.css'

interface ComponentState {
    ratePivot: string | undefined
    sourceRankMap: Map<string, RankCount[]>
    unRatableMap: Map<string, string[]>    // Number conversations missing transcript for comparison <sourceName, conversationId[]>
    notRatedMap: Map<string, string[]>    // Number conversations that haven't been rated <sourceName, conversationId[]>
    maxRank: number
    minRank: number
    numRanks: number
    numConversations: number
}

interface RankCount {
    sourceName: string
    conversationIds: string[]
    count: number
    rank: number
}

class TranscriptRatings extends React.Component<Props, ComponentState> {

    constructor(props: Props) {
        super(props)
        this.state = {
            ratePivot: undefined,
            sourceRankMap: new Map<string, RankCount[]>(),
            unRatableMap: new Map<string, string[]>(),
            notRatedMap: new Map<string, string[]>(),
            maxRank: 0,
            minRank: 0,
            numRanks: 0,
            numConversations: 0
        }
    }

    componentDidMount() {
        if (this.props.testSet) {
            this.onUpdatePivot(this.state.ratePivot || this.props.testSet.sourceNames[0])
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.testSet && prevProps.testSet 
            && (prevProps.testSet.sourceNames.length !== this.props.testSet.sourceNames.length
                || this.props.testSet.ratingPairs !== prevProps.testSet.ratingPairs)) {
            this.onUpdatePivot(this.state.ratePivot || this.props.testSet.sourceNames[0])
        }
    }

    @autobind
    onChangeRateSource(event: React.FormEvent<HTMLDivElement>, item: OF.IDropdownOption) {
        if (item.text) {
            this.onUpdatePivot(item.text)
        }
    }

    @autobind
    onUpdatePivot(ratePivot: string | undefined): void {
        if (!ratePivot || !this.props.testSet || this.props.testSet.sourceNames.length < 2) {
            this.setState({
                sourceRankMap: new Map<string, RankCount[]>(),
                unRatableMap: new Map<string, string[]>(),
                notRatedMap: new Map<string, string[]>(),
                maxRank: 0,
                minRank: 0,
                numRanks: 0,
                numConversations: 0
            })
            return
        }

        // Calculate possible bounds of ranks
        const maxRank = (this.props.testSet.sourceNames.length - 1)
        const minRank = -maxRank
        const numRanks = (maxRank * 2) + 1

        // Generate rank count slots and set count to 0
        const sourceRankMap = new Map<string, RankCount[]>()
        const unRatableMap = new Map<string, string[]>()
        const notRatedMap = new Map<string, string[]>()
        for (const sourceName of this.props.testSet.sourceNames) {
            // Don't generate for pivot source
            if (sourceName !== ratePivot) {
                const rankCounts: RankCount[] = []
                for (let rank = maxRank; rank >= minRank; rank = rank - 1) {
                    rankCounts.push({sourceName, rank, count: 0, conversationIds: [] })
                }
                sourceRankMap.set(sourceName, rankCounts)
                // Get number that aren't rankable (as they don't have matching transcript)
                unRatableMap.set(sourceName, this.props.testSet.unratableConversationIds(sourceName, ratePivot))
                notRatedMap.set(sourceName, this.props.testSet.unratedConversationIds(sourceName, ratePivot))
            }
        }

        // Calculate rankings relative to pivot
        const conversationIds = this.props.testSet.getAllConversationIds()
        for (const conversationId of conversationIds) {
            // Get ranking of pivot item
            const baseItem = this.props.testSet.getTestItem(ratePivot, conversationId)
            if (baseItem && baseItem.ranking !== undefined) {
                for (const sourceName of this.props.testSet.sourceNames) {
                    // Skip the source being pivoted on
                    if (sourceName !== ratePivot) {
                        const rating = this.props.testSet.getRating(ratePivot, sourceName, conversationId)
                        if (rating !== Test.RatingResult.UNKNOWN) {
                            const sourceItem = this.props.testSet.getTestItem(sourceName, conversationId)
                            if (sourceItem && sourceItem.ranking !== undefined) {
                                // Adjust rank relative to pivot
                                const rank = sourceItem.ranking - baseItem.ranking
                                const rankCount = sourceRankMap.get(sourceName)!.find(r => r.rank === rank)!
                                rankCount.conversationIds.push(conversationId)
                                rankCount.count = rankCount.count + 1
                            }
                        }
                    }
                }
            }
        }

        const numConversations = this.props.testSet.numConversations()

        this.setState({
            ratePivot, 
            sourceRankMap, 
            unRatableMap,
            notRatedMap,
            maxRank, 
            minRank, 
            numRanks,
            numConversations
        })
    }

    render() {
        
        return (
            <div>
            {!this.props.testSet || this.props.testSet.sourceNames.length < 2 
                ?
                <div className="cl-testing-warning">
                    {Util.formatMessageId(this.props.intl, FM.TRANSCRIPTRATINGS_WARNING_TITLE)}
                </div>
                :
                <>
                <div className={`cl-testing-dropbox ${OF.FontClassNames.mediumPlus}`}>
                    <OF.Dropdown
                        disabled={!this.props.testSet || this.props.testSet.sourceNames.length < 2}
                        ariaLabel={Util.formatMessageId(this.props.intl, FM.TRANSCRIPTRATINGS_DROPDOWN_TITLE)}
                        label={Util.formatMessageId(this.props.intl, FM.TRANSCRIPTRATINGS_DROPDOWN_TITLE)}
                        selectedKey={this.props.testSet && this.state.ratePivot 
                            ? this.props.testSet.sourceNames.indexOf(this.state.ratePivot)
                            : -1
                        }
                        onChange={this.onChangeRateSource}
                        options={this.props.testSet 
                            ? this.props.testSet.sourceNames
                                .map<OF.IDropdownOption>((tag, i) => ({
                                    key: i,
                                    text: tag
                                })) 
                            : []
                        }
                    />
                </div>
                <div>
                    {this.props.testSet && this.props.testSet.sourceNames.length > 1 &&
                        <div className="cl-transcriptrating-ranktitles">
                            <div className="cl-testing-result-title">{'\u00A0'}</div>
                            <div>
                                {[...Array(this.state.numRanks).keys()].map((rc, i) => {
                                    const rank = this.state.maxRank - i
                                    let label = '\u00A0'
                                    if (rank === 0) {
                                        label = "Same"
                                    }
                                    else if (rank === this.state.maxRank) {
                                        label = "Best"
                                    }
                                    else if (rank === this.state.minRank) {
                                        label = "Worst"
                                    }
                                    else if (rank === 1) {
                                        // Up arrow
                                        label = "\u2B06"
                                    }
                                    else if (rank === -1) {
                                        // Down arrow
                                        label = "\u2B07"
                                    }
                                    return (
                                        <div  
                                            className="cl-testing-source-title"
                                            key={i}
                                        >
                                            {label}
                                        </div>
                                    )}
                                )}
                                <div  
                                    className="cl-testing-source-title cl-transcriptrating-rankbar"
                                >
                                    No Transcript 
                                </div>
                                <div  
                                    className="cl-testing-source-title cl-transcriptrating-rankbutton"
                                >
                                    <OF.DefaultButton
                                        disabled={!this.props.testSet || this.props.testSet.sourceNames.length < 2}
                                        onClick={this.props.onRate}
                                        ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_RATE)}
                                        text={Util.formatMessageId(this.props.intl, FM.BUTTON_RATE)}
                                        iconProps={{ iconName: 'Compare' }}
                                    />
                                </div>
                            </div>
                        </div>
                    }
                    {Array.from(this.state.sourceRankMap.keys())
                        .map(sourceName => {
                            const rankCount: RankCount[] | undefined = this.state.sourceRankMap.get(sourceName)
                            const unrankable = this.state.unRatableMap.get(sourceName) || []
                            const notRated = this.state.notRatedMap.get(sourceName) || []
                            return (
                                <div 
                                    className="cl-transcriptrating-results"
                                    key={sourceName}
                                >
                                    <div className="cl-testing-result-title">
                                        {sourceName}
                                    </div>
                                    <div>
                                        {rankCount && rankCount.map(rc => {
                                            return (
                                                <div  
                                                    className="cl-transcriptrating-result"
                                                    style={{backgroundColor: `${Util.scaledColor(rc.rank)}`}}
                                                    key={`${rc.rank}-${sourceName}`}
                                                    onClick={() => this.props.onView(rc.conversationIds, this.state.ratePivot)}
                                                    role="button"
                                                >
                                                    <span className="cl-testing-result-item cl-testing-result-value">
                                                        {rc.count}
                                                    </span>
                                                    <span className="cl-testing-result-item cl-testing-result-percent">
                                                        {Util.percentOf(rc.count, this.state.numConversations)}
                                                    </span>
                                                </div>
                                            )}
                                        )}
                                        <div
                                            className="cl-transcriptrating-result"
                                            style={{backgroundColor: '#dbdee1'}}
                                            onClick={() => this.props.onView(unrankable, this.state.ratePivot)}
                                            role="button"
                                        >
                                            <span className="cl-testing-result-item cl-testing-result-value">
                                                {unrankable.length}
                                            </span>
                                            <span className="cl-testing-result-item cl-testing-result-percent">
                                                {Util.percentOf(unrankable.length, this.state.numConversations)}
                                            </span>
                                        </div>
                                        <div
                                            className="cl-transcriptrating-result"
                                            style={{backgroundColor: '#e6e8ea'}}
                                            onClick={() => this.props.onView(notRated, this.state.ratePivot)}
                                            role="button"
                                        >
                                            <span className="cl-testing-result-item cl-testing-result-value">
                                                {notRated.length}
                                            </span>
                                            <span className="cl-testing-result-item cl-testing-result-percent">
                                                {Util.percentOf(notRated.length, this.state.numConversations)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        )
                    }
                </div>
                </>
            }
            </div>
        )
    }
}

export interface ReceivedProps {
    testSet: Test.TestSet | undefined
    onView: (conversationIds: string[], conversationPivot?: string) => void
    onRate: () => void
}

type Props = ReceivedProps & InjectedIntlProps

export default connect<{}, {}, ReceivedProps>(null)(injectIntl(TranscriptRatings) as any)