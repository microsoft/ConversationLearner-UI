/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import { autobind } from 'core-decorators'
import { connect } from 'react-redux'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import './TranscriptTestPicker.css'

interface ComponentState {
    sourceName: string | undefined
}

class TranscriptTestPicker extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        sourceName: undefined
    }

    async componentDidMount() {
        if (this.props.sourceNames.length > 0) {
            this.setState({
                sourceName: this.props.sourceNames[0]
            })
        }
    }

    @autobind
    onSelectSourceName(event: React.FormEvent<HTMLDivElement>, item: OF.IDropdownOption) {
        this.setState({
            sourceName: item.text
        })
    }

    @autobind
    onSubmit() {
        if (this.state.sourceName) {
            this.props.onSubmit(this.state.sourceName)
        }
    }

    render() {
        return (
            <OF.Modal
                isOpen={true}
                onDismiss={this.props.onAbandon}
                isBlocking={false}
                containerClassName='cl-modal cl-modal--small'
            >
                <div className="cl-modal_header">
                    <div className={`cl-dialog-title ${OF.FontClassNames.xxLarge}`}>
                        {Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_TESTPICKER_TITLE)} 
                    </div>
                </div>
                <div 
                    className="cl-transcript-loader-body"
                >
                    <OF.Dropdown
                        ariaLabel={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_TESTPICKER_SOURCE)}
                        label={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_TESTPICKER_SOURCE)}
                        selectedKey={this.state.sourceName ? this.props.sourceNames.indexOf(this.state.sourceName) : -1}
                        onChange={this.onSelectSourceName}
                        options={this.props.sourceNames
                            .map<OF.IDropdownOption>((tag, i) => ({
                                key: i,
                                text: tag
                            }))
                        }
                    />

                </div>
                <div className='cl-modal_footer cl-modal-buttons'>
                    <div className="cl-modal-buttons_secondary" />
                    <div className="cl-modal-buttons_primary">
                        <OF.PrimaryButton
                            disabled={this.state.sourceName === null}
                            onClick={this.onSubmit}
                            ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_OK)}
                            text={Util.formatMessageId(this.props.intl, FM.BUTTON_OK)}
                            iconProps={{ iconName: 'Accept' }}
                        />
                        <OF.DefaultButton
                            onClick={this.props.onAbandon}
                            ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_CANCEL)}
                            text={Util.formatMessageId(this.props.intl, FM.BUTTON_CANCEL)}
                            iconProps={{ iconName: 'Cancel' }}
                        />
                    </div>
                </div>
            </OF.Modal>
        )
    }
}

export interface ReceivedProps {
    sourceNames: string[]
    onAbandon: () => void
    onSubmit: (sourceName: string) => void
}

type Props = ReceivedProps & InjectedIntlProps

export default connect<{}, {}, ReceivedProps>(null)(injectIntl(TranscriptTestPicker))