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
    unRatableMap: Map<string, number>    // Number conversations missing transcript for comparison
    notRatedMap: Map<string, number>    // Number conversations that haven't been rated
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
            unRatableMap: new Map<string, number>(),
            notRatedMap: new Map<string, number>(),
            maxRank: 0,
            minRank: 0,
            numRanks: 0,
            numConversations: 0
        }
    }

    componentDidMount() {
        if (this.props.validationSet) {
            this.onUpdatePivot(this.state.ratePivot || this.props.validationSet.sourceNames[0])
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.validationSet && prevProps.validationSet 
            && (prevProps.validationSet.sourceNames.length !== this.props.validationSet.sourceNames.length
                || this.props.validationSet.ratingPairs !== prevProps.validationSet.ratingPairs)) {
            this.onUpdatePivot(this.state.ratePivot || this.props.validationSet.sourceNames[0])
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
        if (!ratePivot || !this.props.validationSet || this.props.validationSet.sourceNames.length < 2) {
            this.setState({
                sourceRankMap: new Map<string, RankCount[]>(),
                unRatableMap: new Map<string, number>(),
                notRatedMap: new Map<string, number>(),
                maxRank: 0,
                minRank: 0,
                numRanks: 0,
                numConversations: 0
            })
            return
        }

        // Calculate possible bounds of ranks
        const maxRank = (this.props.validationSet.sourceNames.length - 1)
        const minRank = -maxRank
        const numRanks = (maxRank * 2) + 1

        // Generate rank count slots and set count to 0
        const sourceRankMap = new Map<string, RankCount[]>()
        const unRatableMap = new Map<string, number>()
        const notRatedMap = new Map<string, number>()
        for (const sourceName of this.props.validationSet.sourceNames) {
            // Don't generate for pivot source
            if (sourceName !== ratePivot) {
                const rankCounts: RankCount[] = []
                for (let rank = minRank; rank <= maxRank; rank = rank + 1) {
                    rankCounts.push({sourceName, rank, count: 0, conversationIds: [] })
                }
                sourceRankMap.set(sourceName, rankCounts)
                // Get number that aren't rankable (as they don't have matching transcript)
                unRatableMap.set(sourceName, this.props.validationSet.numUnratable(ratePivot, sourceName))
                notRatedMap.set(sourceName, this.props.validationSet.numNotRated(ratePivot, sourceName))
            }
        }

        // Calculate rankings relative to pivot
        const conversationIds = this.props.validationSet.getAllConversationIds()
        for (const conversationId of conversationIds) {
            // Get ranking of pivot item
            const baseItem = this.props.validationSet.getItem(ratePivot, conversationId)
            if (baseItem && baseItem.ranking !== undefined) {
                for (const sourceName of this.props.validationSet.sourceNames) {
                    // Skip the source being pivoted on
                    if (sourceName !== ratePivot) {
                        const rating = this.props.validationSet.getRating(ratePivot, sourceName, conversationId)
                        if (rating !== Test.RatingResult.UNKNOWN) {
                            const sourceItem = this.props.validationSet.getItem(sourceName, conversationId)
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

        const numConversations = this.props.validationSet.numConversations()

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
            {!this.props.validationSet || this.props.validationSet.sourceNames.length < 2 
                ?
                <div className="cl-testing-warning">
                    {Util.formatMessageId(this.props.intl, FM.TRANSCRIPTRATINGS_WARNING_TITLE)}
                </div>
                :
                <>
                <div className={`cl-testing-dropbox ${OF.FontClassNames.mediumPlus}`}>
                    <OF.Dropdown
                        disabled={!this.props.validationSet || this.props.validationSet.sourceNames.length < 2}
                        ariaLabel={Util.formatMessageId(this.props.intl, FM.TRANSCRIPTRATINGS_DROPDOWN_TITLE)}
                        label={Util.formatMessageId(this.props.intl, FM.TRANSCRIPTRATINGS_DROPDOWN_TITLE)}
                        selectedKey={this.props.validationSet && this.state.ratePivot 
                            ? this.props.validationSet.sourceNames.indexOf(this.state.ratePivot)
                            : -1
                        }
                        onChange={this.onChangeRateSource}
                        options={this.props.validationSet 
                            ? this.props.validationSet.sourceNames
                                .map<OF.IDropdownOption>((tag, i) => ({
                                    key: i,
                                    text: tag
                                })) 
                            : []
                        }
                    />
                </div>
                <div className="cl-modal_footer cl-modal-buttons">
                    <div className="cl-modal-buttons_secondary">
                        <OF.DefaultButton
                            disabled={!this.props.validationSet || this.props.validationSet.sourceNames.length < 2}
                            onClick={this.props.onRate}
                            ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_RATE)}
                            text={Util.formatMessageId(this.props.intl, FM.BUTTON_RATE)}
                            iconProps={{ iconName: 'Compare' }}
                        />
                    </div>
                </div>
                {this.props.validationSet && this.props.validationSet.sourceNames.length > 1 &&
                    <div className="cl-transcriptrating-ranktitles">
                        <div className="cl-testing-result-title">{'\u00A0'}</div>
                        <div>
                            {[...Array(this.state.numRanks).keys()].map((rc, i) => {
                                const rank = i - this.state.maxRank
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
                                return (
                                    <div  
                                        className="cl-testing-source-title cl-transcriptrating-ranktitle"
                                        key={i}
                                    >
                                        {label}
                                    </div>
                                )}
                            )}
                            <div  
                                className="cl-testing-source-title cl-transcriptrating-ranktitle"
                            >
                                Not Rated 
                            </div>
                            <div  
                                className="cl-testing-source-title cl-transcriptrating-ranktitle"
                            >
                                No Transcript 
                            </div>
                        </div>
                    </div>
                }
                {Array.from(this.state.sourceRankMap.keys())
                    .map(sourceName => {
                        const rankCount: RankCount[] | undefined = this.state.sourceRankMap.get(sourceName)
                        const unrankableCount = this.state.unRatableMap.get(sourceName) || 0
                        const notRatedCount = this.state.notRatedMap.get(sourceName) || 0
                        return (
                            <div key={sourceName}>
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
                                        style={{backgroundColor: '#e6e8ea'}}
                                    >
                                        <span className="cl-testing-result-item cl-testing-result-value">
                                            {notRatedCount}
                                        </span>
                                        <span className="cl-testing-result-item cl-testing-result-percent">
                                            {Util.percentOf(notRatedCount, this.state.numConversations)}
                                        </span>
                                    </div>
                                    <div
                                        className="cl-transcriptrating-result"
                                        style={{backgroundColor: '#dbdee1'}}
                                    >
                                        <span className="cl-testing-result-item cl-testing-result-value">
                                            {unrankableCount}
                                        </span>
                                        <span className="cl-testing-result-item cl-testing-result-percent">
                                            {Util.percentOf(unrankableCount, this.state.numConversations)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    )
                }
                </>
            }
            </div>
        )
    }
}

export interface ReceivedProps {
    validationSet: Test.ValidationSet | undefined
    onView: (conversationIds: string[], conversationPivot?: string) => void
    onRate: () => void
}

type Props = ReceivedProps & InjectedIntlProps

export default connect<{}, {}, ReceivedProps>(null)(injectIntl(TranscriptRatings) as any)