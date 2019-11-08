/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import * as Test from '../../types/TestObjects'
import { autobind } from 'core-decorators'
import { connect } from 'react-redux'
import { injectIntl, InjectedIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../../react-intl-messages'
import '../../routes/Apps/App/Testing.css'
import './TranscriptRatings.css'

interface ComponentState {
    transcriptColumns: IRenderableColumn[]
}

interface RenderData {
    sourceName: string,
    transcriptCount: number,
    usesLG: boolean
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
            minWidth: 250,
            maxWidth: 250,
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
        },
        {
            key: 'useslg',
            name: Util.formatMessageId(intl, FM.TESTING_TABLE_LG_LABEL),
            fieldName: 'userlg',
            minWidth: 50,
            isResizable: false,
            getSortValue: renderResults => renderResults.usesLG ? 'a' : 'b',
            render: renderResults => <OF.Icon iconName={renderResults.usesLG ? 'CheckMark' : 'Remove'} className="cl-icon" data-testid="action-details-wait" />
        },
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
    async onLoadLGFiles(files: any): Promise<void> {
        await this.props.onLoadLGFiles(files)

        // If still open clear input so user can reload same file
        let fileInput = (this.loadLGFileInput as HTMLInputElement)
        if (fileInput) {
            fileInput.value = ""
        }
    }

    @autobind
    async onLoadTranscriptFiles(files: any): Promise<void> {
        await this.props.onLoadTranscriptFiles(files)

        // If still open, clear input so user can reload same file
        let fileInput = (this.loadTranscriptsFileInput as HTMLInputElement)
        {
            fileInput.value = ""
        }
    }

    renderData(): RenderData[] {

        if (!this.props.testSet) {
            return []
        }
        const renderResults: RenderData[] = []
        for (const sourceName of this.props.testSet.sourceNames) {

            let items: Test.TestItem[] = this.props.testSet.items
            .filter(i => i.sourceName === sourceName) 

            renderResults.push({
                sourceName: sourceName,
                transcriptCount: items.length,
                usesLG: this.props.testSet.usesLgMap.get(sourceName) ?? false
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
                    {renderResults.length > 0
                    ?
                    <OF.DetailsList
                        className={OF.FontClassNames.mediumPlus}
                        items={renderResults}
                        columns={this.state.transcriptColumns}
                        checkboxVisibility={OF.CheckboxVisibility.hidden}
                        onRenderRow={(props, defaultRender) => <div data-selection-invoke={true}>{defaultRender?.(props)}</div>}
                        onRenderItemColumn={(rr: RenderData, i, column: IRenderableColumn) =>
                            column.render(rr)}
                    />
                    : 
                    <div className="cl-testing-warning">
                        {Util.formatMessageId(this.props.intl, FM.TRANSCRIPTLIST_WARNING_TITLE)}
                    </div>
                    }
                    {this.props.testSet && this.props.testSet.lgItems.length > 0 &&
                        <div className="cl-testing-lglabel">
                            {`${this.props.testSet.lgItems.length} ${Util.formatMessageId(this.props.intl, FM.TRANSCRIPTLIST_LGLOADED)}`}
                        </div>
                    }
                    {this.props.testSet?.lgItems.length === 0 && this.props.testSet.usesLG() &&
                        <div className="cl-testing-lglabel cl-text--warning">
                            {Util.formatMessageId(this.props.intl, FM.TRANSCRIPTLIST_NOLG)}
                        </div>
                    }
                    <div className="cl-modal-buttons cl-modal_footer">
                        <div className="cl-modal-buttons_secondary">
                            <OF.PrimaryButton
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.TRANSCRIPTLIST_BUTTON_ADD_TRANSCRIPTS)}
                                text={Util.formatMessageId(this.props.intl, FM.TRANSCRIPTLIST_BUTTON_ADD_TRANSCRIPTS)}
                                iconProps={{ iconName: 'BulkUpload' }}
                                onClick={() => this.loadTranscriptsFileInput.click()}
                            />
                            <OF.PrimaryButton
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.TRANSCRIPTLIST_BUTTON_ADD_LG)}
                                text={Util.formatMessageId(this.props.intl, FM.TRANSCRIPTLIST_BUTTON_ADD_LG)}
                                iconProps={{ iconName: 'BulkUpload' }}
                                onClick={() => this.loadLGFileInput.click()}
                            />
                        </div>
                        <div className="cl-modal-buttons_primary">
                            <OF.DefaultButton
                                disabled={!this.props.testSet}
                                onClick={() => this.props.onView(Test.ComparisonResultType.ALL)}
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.TRANSCRIPTLIST_BUTTON_VIEW)}
                                text={Util.formatMessageId(this.props.intl, FM.TRANSCRIPTLIST_BUTTON_VIEW)}
                                iconProps={{ iconName: 'DiffSideBySide' }}
                            />
                            <OF.PrimaryButton
                                disabled={renderResults.length === 0}
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.TRANSCRIPTLIST_BUTTON_TEST_MODEL)}
                                text={Util.formatMessageId(this.props.intl, FM.TRANSCRIPTLIST_BUTTON_TEST_MODEL)}
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

export interface ReceivedProps {
    testSet: Test.TestSet | undefined
    onView: (compareType: Test.ComparisonResultType, comparePivot?: string, compareSource?: string) => void
    onLoadTranscriptFiles: (transcriptFiles: any) => Promise<void>
    onLoadLGFiles: (lgFiles: any) => Promise<void>
    onTest: () => Promise<void>
}

type Props = ReceivedProps & InjectedIntlProps

export default connect<{}, {}, ReceivedProps>(null)(injectIntl(TranscriptList) as any)