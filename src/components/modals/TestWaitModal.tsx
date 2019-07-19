/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import { connect } from 'react-redux'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'

class TestWaitModal extends React.Component<Props> {
    render() {
        return (
            <React.Fragment>
                <OF.Modal
                    isOpen={true}
                    isBlocking={true}
                    containerClassName='cl-modal cl-modal--small'
                >
                    <div className='cl-modal_header'>
                        <span className={OF.FontClassNames.xxLarge}>
                            {`Testing ${this.props.index} of ${this.props.total}...`}
                        </span>
                    </div>
                    <OF.Spinner size={OF.SpinnerSize.large} />
                    <div className="cl-modal_footer cl-modal-buttons">
                        <div className="cl-modal-buttons_secondary"/>
                        <div className="cl-modal-buttons_primary">
                            <OF.DefaultButton
                                onClick={this.props.onClose}
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_CLOSE)}
                                text={Util.formatMessageId(this.props.intl, FM.BUTTON_CANCEL)}
                                iconProps={{ iconName: 'Cancel' }}
                            />
                        </div>
                    </div>
                </OF.Modal>

            </React.Fragment>
        )
    }
}

export interface ReceivedProps {
    index: number
    total: number
    onClose: () => void
}

type Props = ReceivedProps & ReceivedProps & InjectedIntlProps

export default connect<{}, {}, ReceivedProps>(null)(injectIntl(TestWaitModal))