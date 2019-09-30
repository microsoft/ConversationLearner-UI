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
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../../react-intl-messages'
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

    componentDidUpdate(prevProps: Props) {
        // If no compare selected yet, do compare if more than one soucce loaded
        if (!this.state.comparePivot && this.props.validationSet && this.props.validationSet.sourceNames.length > 1) {
            this.onCompare(this.props.validationSet.sourceNames[0])
        }
    }

    @autobind
    async onChangeCompareSource(event: React.FormEvent<HTMLDivElement>, item: OF.IDropdownOption) {
        if (item.text) {
            this.onCompare(item.text)
        }
    }

    @autobind
    async onCompare(comparePivot: string | undefined): Promise<void> {
        this.setState({comparePivot})
        this.props.onCompare(comparePivot)
    }

    resultRenderData(): SourceRenderData[] {

        if (!this.props.validationSet) {
            return []
        }
        const renderResults: SourceRenderData[] = []
        for (const sourceName of this.props.validationSet.sourceNames) {

            let items: Test.ValidationItem[] = this.props.validationSet.items
            .filter(i => i.sourceName === sourceName) 

            if (this.state.comparePivot && sourceName !== this.state.comparePivot) {
                const comparisons  = this.props.validationSet.getSourceComparisons(sourceName, this.state.comparePivot)

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

        const numConversations = this.props.validationSet 
            ? this.props.validationSet.numConversations()
            : 0

        return (
            <div>
            <div className={OF.FontClassNames.mediumPlus}>
                <OF.Dropdown
                    disabled={!this.props.validationSet || this.props.validationSet.sourceNames.length < 2}
                    ariaLabel={"Compare Against"}//LARS
                    label={"Compare Against"}//LARS
                    selectedKey={this.props.validationSet && this.state.comparePivot 
                        ? this.props.validationSet.sourceNames.indexOf(this.state.comparePivot)
                        : -1
                    }
                    onChange={this.onChangeCompareSource}
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
            {this.props.validationSet && this.props.validationSet.sourceNames.length > 1 
                ?
                <div className={`cl-testing-result-group ${!this.props.validationSet || this.props.validationSet.items.length === 0 ? ' cl-test-disabled' : ''}`}>
                    <div className="cl-testing-result cl-testing-source-title"/>
                    <div className="cl-testing-result">
                        <span className="cl-testing-result-title">Reproduced: </span>
                    </div>
                    <div className="cl-testing-result">
                        <span className="cl-testing-result-title">Changed: </span>
                    </div>
                    {hasNoTranscript &&
                        <div className="cl-testing-result">
                            <span className="cl-testing-result-title">No Transcript: </span>
                        </div>
                    }
                    {hasInvalidTranscript &&
                        <div className="cl-testing-result">
                            <span className="cl-testing-result-title">Invalid Transcript: </span>
                        </div>
                    }
                </div>
                :
                <div>
                    At least two set of transcripts must be loaded 
                </div>
            }
            {this.state.comparePivot && renderResults
                .filter(rr => this.state.comparePivot && rr.sourceName !== this.state.comparePivot)
                .map(rr => {
                return (
                    <div 
                        className={`cl-testing-result-group ${!this.props.validationSet || this.props.validationSet.items.length === 0 ? ' cl-test-disabled' : ''}`}
                        key={rr.sourceName}
                    >
                        <div className="cl-testing-result cl-testing-source-title">
                            {rr.sourceName}
                        </div>
                        <div className="cl-testing-result">
                            <span className="cl-testing-result-item cl-testing-result-value">
                                {rr.reproduced.length}
                            </span>
                            <span className="cl-testing-result-item cl-testing-result-percent">
                                {Util.percentOf(rr.reproduced.length, numConversations)}
                            </span>
                            <div className="cl-buttons-row cl-testing-result-buttons">
                                <OF.DefaultButton
                                    disabled={rr.reproduced.length === 0}
                                    onClick={() => this.props.onView(Test.ComparisonResultType.REPRODUCED, this.state.comparePivot, rr.sourceName)}
                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                    text={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                    iconProps={{ iconName: 'DiffSideBySide' }}
                                />
                            </div>
                        </div>
                        <div className="cl-testing-result">
                            <span className="cl-testing-result-item cl-testing-result-value">
                                {rr.changed.length}
                            </span>
                            <span className="cl-testing-result-item cl-testing-result-percent">
                                {Util.percentOf(rr.changed.length, numConversations)}
                            </span>
                            <div className="cl-buttons-row cl-testing-result-buttons">
                                <OF.DefaultButton
                                    disabled={rr.changed.length === 0}
                                    onClick={() => this.props.onView(Test.ComparisonResultType.CHANGED, this.state.comparePivot, rr.sourceName)}
                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                    text={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                    iconProps={{ iconName: 'DiffSideBySide' }}
                                />
                            </div>
                        </div>
                        {hasNoTranscript &&
                            <div className="cl-testing-result">
                                <span className="cl-testing-result-item cl-testing-result-item--mismatch cl-testing-result-value">
                                    {rr.no_transcript.length}
                                </span>
                                <span className="cl-testing-result-item cl-testing-result-item--mismatch cl-testing-result-percent">
                                    {Util.percentOf(rr.no_transcript.length, numConversations)}
                                </span>
                                <div className="cl-buttons-row cl-testing-result-buttons">
                                    <OF.DefaultButton
                                        disabled={rr.no_transcript.length === 0}
                                        onClick={() => this.props.onView(Test.ComparisonResultType.NO_TRANSCRIPT, this.state.comparePivot, rr.sourceName)}
                                        ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                        text={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                        iconProps={{ iconName: 'DiffSideBySide' }}
                                    />
                                </div>
                            </div>
                        }
                        {hasInvalidTranscript &&
                            <div className="cl-testing-result">
                                <span className="cl-testing-result-item cl-testing-result-item--mismatch cl-testing-result-value">
                                    {rr.invalid_transcript.length}
                                </span>
                                <span className="cl-testing-result-item cl-testing-result-item--mismatch cl-testing-result-percent">
                                    {Util.percentOf(rr.invalid_transcript.length, numConversations)}
                                </span>
                                <div className="cl-buttons-row cl-testing-result-buttons">
                                    <OF.DefaultButton
                                        disabled={rr.invalid_transcript.length === 0}
                                        onClick={() => this.props.onView(Test.ComparisonResultType.INVALID_TRANSCRIPT, this.state.comparePivot, rr.sourceName)}
                                        ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                        text={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                        iconProps={{ iconName: 'DiffSideBySide' }}
                                    />
                                </div>
                            </div>
                        }
                    </div>
                )}
            )}
        </div>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}

const mapStateToProps = (state: State) => {
    // LARS remove
    return {
    }
}

export interface ReceivedProps {
    validationSet: Test.ValidationSet | undefined
    onCompare: (comparePivot: string | undefined) => void
    onView: (compareType: Test.ComparisonResultType, comparePivot?: string, compareSource?: string) => void
}

// Props types inferred from mapStateToProps 
const stateProps = returntypeof(mapStateToProps);
type Props = typeof stateProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, {}, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TranscriptComparisons) as any)