/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import * as Test from '../../types/TestObjects'
import { FM } from '../../react-intl-messages'
import { connect } from 'react-redux'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { autobind } from 'core-decorators'
import '../../routes/Apps/App/Testing.css'
import './TranscriptRatings.css'

interface ComponentState {
    comparePivot: string | undefined
}

interface SourceRenderData {
    sourceName: string,
    transcriptCount: number,
    reproduced: Test.SourceComparison[]
    changed: Test.SourceComparison[]
    no_transcript: Test.SourceComparison[]
    invalid_transcript: Test.SourceComparison[]
}

class TranscriptComparisons extends React.Component<Props, ComponentState> {

    constructor(props: Props) {
        super(props)
        this.state = {
            comparePivot: undefined,
        }
    }

    componentDidMount() {
        // If no compare selected yet, do compare if more than one source loaded
        if (!this.state.comparePivot && this.props.testSet && this.props.testSet.sourceNames.length > 1) {
            this.onCompare(this.props.testSet.sourceNames[0])
        }
    }

    componentDidUpdate() {
        // If no compare selected yet, do compare if more than one source loaded
        if (!this.state.comparePivot && this.props.testSet && this.props.testSet.sourceNames.length > 1) {
            this.onCompare(this.props.testSet.sourceNames[0])
        }
    }

    @autobind
    async onChangeCompareSource(event: React.FormEvent<HTMLDivElement>, item: OF.IDropdownOption) {
        if (item.text) {
            this.onCompare(item.text)
        }
    }

    @autobind
    onCompare(comparePivot: string | undefined): void {
        this.setState({comparePivot})
        this.props.onCompare(comparePivot)
    }

    resultRenderData(): SourceRenderData[] {

        if (!this.props.testSet) {
            return []
        }

        // Gatcher up items by result type
        const renderResults: SourceRenderData[] = []
        for (const sourceName of this.props.testSet.sourceNames) {

            let items: Test.TestItem[] = this.props.testSet.items
            .filter(i => i.sourceName === sourceName) 

            // Skip the pivot
            if (this.state.comparePivot && sourceName !== this.state.comparePivot) {
                const comparisons  = this.props.testSet.getSourceComparisons(sourceName, this.state.comparePivot)

                const reproduced = comparisons.filter(c => c.result === Test.ComparisonResultType.REPRODUCED)
                const changed = comparisons.filter(c => c.result === Test.ComparisonResultType.CHANGED)
                const no_transcript = comparisons.filter(tr => tr.result === Test.ComparisonResultType.NO_TRANSCRIPT)
                const invalid_transcript = comparisons.filter(tr => tr.result === Test.ComparisonResultType.INVALID_TRANSCRIPT)

                renderResults.push({
                    sourceName: sourceName,
                    transcriptCount: items.length,
                    reproduced,
                    changed,
                    no_transcript,
                    invalid_transcript
                })
            }
            else {
                renderResults.push({
                    sourceName: sourceName,
                    transcriptCount: items.length,
                    reproduced: [],
                    changed: [],
                    no_transcript: [],
                    invalid_transcript: []
                })
            }
        }
        return renderResults
    }

    render() {
        const renderResults = this.resultRenderData()
        
        const hasNoTranscript = renderResults.some(rr => rr.no_transcript.length > 0)
        const hasInvalidTranscript = renderResults.some(rr => rr.invalid_transcript.length > 0)

        const numConversations = this.props.testSet 
            ? this.props.testSet.numConversations()
            : 0

        return (
            <div>
            {this.props.testSet && this.props.testSet.sourceNames.length > 1 
                ?
                <>
                    <div className={`cl-testing-dropbox ${OF.FontClassNames.mediumPlus}`}>
                        <OF.Dropdown
                            disabled={!this.props.testSet || this.props.testSet.sourceNames.length < 2}
                            ariaLabel={Util.formatMessageId(this.props.intl, FM.TRANSCRIPTCOMPARISONS_DROPDOWN_TITLE)}
                            label={Util.formatMessageId(this.props.intl, FM.TRANSCRIPTCOMPARISONS_DROPDOWN_TITLE)}
                            selectedKey={this.props.testSet && this.state.comparePivot 
                                ? this.props.testSet.sourceNames.indexOf(this.state.comparePivot)
                                : -1
                            }
                            onChange={this.onChangeCompareSource}
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
                    <div className={`cl-testing-result-group ${!this.props.testSet || this.props.testSet.items.length === 0 ? ' cl-test-disabled' : ''}`}>
                        <div className="cl-testing-result cl-testing-source-title"/>
                        <div className="cl-testing-result">
                            <span className="cl-testing-source-title">Reproduced: </span>
                        </div>
                        <div className="cl-testing-result">
                            <span className="cl-testing-source-title">Changed: </span>
                        </div>
                        {hasNoTranscript &&
                            <div className="cl-testing-result">
                                <span className="cl-testing-source-title">No Transcript: </span>
                            </div>
                        }
                        {hasInvalidTranscript &&
                            <div className="cl-testing-result">
                                <span className="cl-testing-source-title">Invalid Transcript: </span>
                            </div>
                        }
                    </div>
                </>
                :
                <div className="cl-testing-warning">
                    {Util.formatMessageId(this.props.intl, FM.TRANSCRIPTCOMPARISONS_WARNING_TITLE)}
                </div>
            }
            {this.state.comparePivot && renderResults
                .filter(rr => this.state.comparePivot && rr.sourceName !== this.state.comparePivot)
                .map(rr => {
                return (
                    <div 
                        className={`cl-testing-result-group ${!this.props.testSet || this.props.testSet.items.length === 0 ? ' cl-test-disabled' : ''}`}
                        key={rr.sourceName}
                    >
                        <div className="cl-testing-result cl-testing-source-title">
                            {rr.sourceName}
                        </div>
                        <div 
                            className="cl-testing-result"
                            onClick={() => this.props.onView(Test.ComparisonResultType.REPRODUCED, this.state.comparePivot, rr.sourceName)}
                            role="button"
                        >
                            <span className="cl-testing-result-item cl-testing-result-value">
                                {rr.reproduced.length}
                            </span>
                            <span className="cl-testing-result-item cl-testing-result-percent">
                                {Util.percentOf(rr.reproduced.length, numConversations)}
                            </span>
                        </div>
                        <div 
                            className="cl-testing-result"
                            onClick={() => this.props.onView(Test.ComparisonResultType.CHANGED, this.state.comparePivot, rr.sourceName)}
                            role="button"
                        >
                            <span className="cl-testing-result-item cl-testing-result-value">
                                {rr.changed.length}
                            </span>
                            <span className="cl-testing-result-item cl-testing-result-percent">
                                {Util.percentOf(rr.changed.length, numConversations)}
                            </span>
                        </div>
                        {hasNoTranscript &&
                            <div 
                                className="cl-testing-result"
                                onClick={() => this.props.onView(Test.ComparisonResultType.NO_TRANSCRIPT, this.state.comparePivot, rr.sourceName)}
                                role="button"
                            >
                                <span className="cl-testing-result-item cl-testing-result-item--mismatch cl-testing-result-value">
                                    {rr.no_transcript.length}
                                </span>
                                <span className="cl-testing-result-item cl-testing-result-item--mismatch cl-testing-result-percent">
                                    {Util.percentOf(rr.no_transcript.length, numConversations)}
                                </span>
                            </div>
                        }
                        {hasInvalidTranscript &&
                            <div 
                                className="cl-testing-result"
                                onClick={() => this.props.onView(Test.ComparisonResultType.INVALID_TRANSCRIPT, this.state.comparePivot, rr.sourceName)}
                                role="button"            
                            >
                                <span className="cl-testing-result-item cl-testing-result-item--mismatch cl-testing-result-value">
                                    {rr.invalid_transcript.length}
                                </span>
                                <span className="cl-testing-result-item cl-testing-result-item--mismatch cl-testing-result-percent">
                                    {Util.percentOf(rr.invalid_transcript.length, numConversations)}
                                </span>
                            </div>
                        }
                    </div>
                )}
            )}
        </div>
        )
    }
}

export interface ReceivedProps {
    testSet: Test.TestSet | undefined
    onCompare: (comparePivot: string | undefined) => void
    onView: (compareType: Test.ComparisonResultType, comparePivot?: string, compareSource?: string) => void
}

type Props = ReceivedProps & InjectedIntlProps

export default connect<{}, {}, ReceivedProps>(null)(injectIntl(TranscriptComparisons) as any)