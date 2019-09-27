/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import * as Test from '../../types/TestObjects'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../../types'
import { injectIntl,/* InjectedIntl, LARS*/ InjectedIntlProps } from 'react-intl'
import { FM } from '../../react-intl-messages'
import { autobind } from 'core-decorators'
import '../../routes/Apps/App/Testing.css'
import './TranscriptRatings.css'

interface ComponentState {
    ratePivot: string | undefined,
    relativeRankings: RelativeRanking[],
    sourceRankMap: Map<string, RankCount[]>
    maxRank: number, 
    minRank: number,
    numRanks: number
}

interface RelativeRanking {
    conversationId: string,
    sourceName: string,
    rank: number
}

interface RankCount {
    sourceName: string
    count: number
    rank: number
}

class TranscriptRatings extends React.Component<Props, ComponentState> {

    constructor(props: Props) {
        super(props)
        this.state = {
            ratePivot: undefined,
            relativeRankings: [],
            sourceRankMap: new Map<string, RankCount[]>(),
            maxRank: 0,
            minRank: 0,
            numRanks: 0
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (!this.state.ratePivot && this.props.validationSet && this.props.validationSet.sourceNames.length > 0) {
            this.onRate(this.props.validationSet.sourceNames[0])
        }
    }

    @autobind
    async onChangeRateSource(event: React.FormEvent<HTMLDivElement>, item: OF.IDropdownOption) {
        if (item.text) {
            this.onRate(item.text)
        }
    }

    @autobind
    async onRate(ratePivot: string | undefined): Promise<void> {
        if (!ratePivot || !this.props.validationSet || this.props.validationSet.sourceNames.length === 0) {
            return
        }

        // Calculate possible bounds of ranks
        const maxRank = (this.props.validationSet.sourceNames.length - 1)
        const minRank = -maxRank
        const numRanks = (maxRank * 2) + 1

        // Generate rank count slots and set count to 0
        const sourceRankMap = new Map<string, RankCount[]>()
        for (const sourceName of this.props.validationSet.sourceNames) {
            // Don't generate for pivot sourde
            if (sourceName !== ratePivot) {
                const rankCounts: RankCount[] = []
                for (let rank = minRank; rank <= maxRank; rank = rank + 1) {
                    rankCounts.push({sourceName, rank, count: 0 })
                }
                sourceRankMap.set(sourceName, rankCounts)
            }
        }

        // Calculate rankings relative to pivot
        const relativeRankings: RelativeRanking[] = []
        const conversationIds = this.props.validationSet.getAllConversationIds()
        for (const conversationId of conversationIds) {
            // Get ranking of pivot item
            const baseItem = this.props.validationSet.getItem(ratePivot, conversationId)
            if (baseItem && baseItem.ranking !== undefined) {
                for (const sourceName of this.props.validationSet.sourceNames) {
                    // Skip the source being pivoted on
                    if (sourceName !== ratePivot) {
                        const sourceItem = this.props.validationSet.getItem(sourceName, conversationId)
                        if (sourceItem && sourceItem.ranking !== undefined) {
                            // Adjust rank relative to pivot
                            const rank = sourceItem.ranking - baseItem.ranking
                            relativeRankings.push({conversationId, sourceName, rank })

                            const rankCount = sourceRankMap.get(sourceName)!.find(r => r.rank === rank)
                            rankCount!.count = rankCount!.count + 1
                        }
                    }
                }
            }
        }
        this.setState({ratePivot, relativeRankings, sourceRankMap, maxRank, minRank, numRanks})
    }

    // Generate colors that scale with rating
    getRatingColor(rating: number): string {
        if (rating === 0) {
            return '#ffec8c'
        }
        if (rating > 0) {
            const scale = Math.pow(0.9, rating - 1)
            const r = scale * 224
            const g = 255
            const b = scale * 224
            return Util.rgbToHex(r, g, b)
        }
        else {
            const scale = Math.pow(0.8, (-rating) - 1)
            const r = 255
            const g = scale * 224
            const b = scale * 224
            return Util.rgbToHex(r, g, b)
        }
    }

    render() {
        const numRanked = this.props.validationSet ? this.props.validationSet.sourceNames.length - 1 : 0
        return (
            <div>
                <div className={OF.FontClassNames.mediumPlus}>
                    <OF.Dropdown
                        disabled={!this.props.validationSet || this.props.validationSet.sourceNames.length < 2}
                        ariaLabel={"Relative To:"}//LARS
                        label={"Relative To:"}//LARS
                        selectedKey={this.props.validationSet && this.state.ratePivot 
                            ? this.props.validationSet.sourceNames.indexOf(this.state.ratePivot)
                            : -1
                        }
                        onChange={this.onChangeRateSource}
                        placeholder={Util.formatMessageId(this.props.intl, FM.TRAINDIALOGS_FILTERING_TAGS_LABEL)}
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
                                label = "Worse"
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
                    </div>
                </div>
                {Array.from(this.state.sourceRankMap.keys())
                    .map(sourceName => {
                        const rankCount: RankCount[] | undefined = this.state.sourceRankMap.get(sourceName)
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
                                                style={{backgroundColor: `${this.getRatingColor(rc.rank)}`}}
                                                key={`${rc.rank}-${sourceName}`}
                                            >
                                                <span className="cl-testing-result-item cl-testing-result-value">
                                                    {rc.count}
                                                </span>
                                                <span className="cl-testing-result-item cl-testing-result-percent">
                                                    {Util.percentOf(rc.count, numRanked)}
                                                </span>
                                            </div>
                                        )}
                                    )}
                                </div>
                            </div>
                        )}
                    )
                }
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}

const mapStateToProps = (state: State) => {
    if (!state.bot.botInfo) {
        throw new Error(`You attempted to render the ActionDetailsList which requires botInfo, but botInfo was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }

    return {
        entities: state.entities,
        botInfo: state.bot.botInfo
    }
}

export interface ReceivedProps {
    validationSet: Test.ValidationSet | undefined
}

// Props types inferred from mapStateToProps 
const stateProps = returntypeof(mapStateToProps);
type Props = typeof stateProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, {}, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TranscriptRatings) as any)