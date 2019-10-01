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
import { injectIntl, InjectedIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../../react-intl-messages'
import '../../routes/Apps/App/Testing.css'
import './TranscriptRatings.css'
import { autobind } from 'core-decorators'

interface ComponentState {
    transcriptColumns: IRenderableColumn[]
}

interface RenderData {
    sourceName: string,
    transcriptCount: number,
}

interface IRenderableColumn extends OF.IColumn {
    render: (renderResults: RenderData) => JSX.Element | JSX.Element[]
    getSortValue: (renderResults: RenderData) => string
}

function getColumns(intl: InjectedIntl): IRenderableColumn[] {
    return [
        {
            key: 'source',
            name: Util.formatMessageId(intl, FM.TESTING_TABLE_SOURCE_LABEL),
            fieldName: 'source',
            minWidth: 150,
            maxWidth: 150,
            isResizable: true,
            isSortedDescending: true,
            getSortValue: renderResults => renderResults.sourceName.toLowerCase(),
            render: renderResults => <span data-testid="entities-name" className={OF.FontClassNames.mediumPlus}>{renderResults.sourceName}</span>
        },
        {
            key: 'count',
            name: Util.formatMessageId(intl, FM.TESTING_TABLE_COUNT_LABEL),
            fieldName: 'count',
            minWidth: 180,
            maxWidth: 180,
            isResizable: true,
            getSortValue: renderResults => renderResults.transcriptCount.toString(),
            render: renderResults => {
                return (
                    <span data-testid="entities-type" className={OF.FontClassNames.mediumPlus}>
                        {renderResults.transcriptCount}
                    </span>)
            }
        }
    ]
}

class TranscriptList extends React.Component<Props, ComponentState> {

    private loadTranscriptsFileInput: any
    private loadLGFileInput: any

    constructor(props: Props) {
        super(props)
        this.state = {
            transcriptColumns: getColumns(this.props.intl),
        }
    }

    @autobind
    onLoadLGFiles(files: any): void {
        this.props.onLoadLGFiles(files)

        // Clear filename so user can reload same file
        let fileInput = (this.loadLGFileInput as HTMLInputElement)
        fileInput.value = ""
    }

    @autobind
    onLoadTranscriptFiles(files: any): void {
        this.props.onLoadTranscriptFiles(files)

        // Clear filename so user can reload same file
        let fileInput = (this.loadTranscriptsFileInput as HTMLInputElement)
        fileInput.value = ""
    }

    renderData(): RenderData[] {

        if (!this.props.validationSet) {
            return []
        }
        const renderResults: RenderData[] = []
        for (const sourceName of this.props.validationSet.sourceNames) {

            let items: Test.ValidationItem[] = this.props.validationSet.items
            .filter(i => i.sourceName === sourceName) 

            renderResults.push({
                sourceName: sourceName,
                transcriptCount: items.length
            })
        }
        return renderResults
    }

    render() {
        const renderResults = this.renderData()

        return (
            <div>
                <input
                    hidden={true}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(event) => this.onLoadTranscriptFiles(event.target.files)}
                    ref={ele => (this.loadTranscriptsFileInput = ele)}
                    multiple={true}
                />
                <input
                    hidden={true}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(event) => this.onLoadLGFiles(event.target.files)}
                    ref={ele => (this.loadLGFileInput = ele)}
                    multiple={true}
                />
                <div className="cl-testing-trascript-group">
                    {this.props.validationSet && this.props.validationSet.lgMap.size > 0 &&
                        <div>
                            {`${this.props.validationSet.lgMap.size} LG items loaded`}
                        </div>
                    }
                    {renderResults.length > 0
                    ?
                    <OF.DetailsList
                        className={OF.FontClassNames.mediumPlus}
                        items={renderResults}
                        columns={this.state.transcriptColumns}
                        checkboxVisibility={OF.CheckboxVisibility.hidden}
                        onRenderRow={(props, defaultRender) => <div data-selection-invoke={true}>{defaultRender && defaultRender(props)}</div>}
                        onRenderItemColumn={(rr: RenderData, i, column: IRenderableColumn) =>
                            column.render(rr)}
                    />
                    : "No Transcripts"
                    }
                    <div className="cl-modal-buttons cl-modal_footer">
                        <div className="cl-modal-buttons_primary">
                            <OF.PrimaryButton
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_ADD_TRANSCRIPTS)}
                                text={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_ADD_TRANSCRIPTS)}
                                iconProps={{ iconName: 'TestCase' }}
                                onClick={() => this.loadTranscriptsFileInput.click()}
                            />
                            <OF.PrimaryButton
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_ADD_TRANSCRIPTS)}
                                text={"Add LG"}// LARS
                                iconProps={{ iconName: 'TestCase' }}
                                onClick={() => this.loadLGFileInput.click()}
                            />
                            <OF.DefaultButton
                                disabled={!this.props.validationSet}
                                onClick={() => this.props.onView(Test.ComparisonResultType.ALL)}
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.TESTING_BUTTON_SAVE_RESULTS)}
                                text="View Transcripts" // LARS
                                iconProps={{ iconName: 'DownloadDocument' }}
                            />
                            <OF.PrimaryButton
                                disabled={renderResults.length === 0}
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_TEST_MODEL)}
                                text={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_TEST_MODEL)}
                                iconProps={{ iconName: 'TestCase' }}
                                onClick={this.props.onTest}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);//LARS remove
}

const mapStateToProps = (state: State) => {
    return { // LARS remove
    }
}

export interface ReceivedProps {
    validationSet: Test.ValidationSet | undefined
    onView: (compareType: Test.ComparisonResultType, comparePivot?: string, compareSource?: string) => void
    onLoadTranscriptFiles: (transcriptFiles: any) => void
    onLoadLGFiles: (lgFiles: any) => void
    onTest: () => Promise<void>
}

// Props types inferred from mapStateToProps 
const stateProps = returntypeof(mapStateToProps);
type Props = typeof stateProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, {}, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TranscriptList) as any)