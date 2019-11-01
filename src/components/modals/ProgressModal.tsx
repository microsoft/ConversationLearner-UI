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

class ProgessModal extends React.Component<Props> {

    displayTime(ticks: number) {
        const ms = ticks / 1000
        const hh = Math.floor(ms / 3600)
        const mm = Math.floor((ms % 3600) / 60)

        if (hh > 0) {
            return `${hh} hours and ${mm} minutes`
        }
        else if (mm > 0) {
            return `${mm} minutes`
        }
        else {
            return `Seconds`
        }
    }

    render() {
        return (
            <OF.Modal
                isOpen={this.props.open}
                isBlocking={true}
                containerClassName='cl-modal cl-modal--small cl-modal--high'
            >
                <div className='cl-modal_header'>
                    <span className={OF.FontClassNames.xxLarge}>
                        {`${this.props.title} ${this.props.index} of ${this.props.total}...`}
                    </span>
                </div>
                <div className='cl-modal_subheader'>
                    {this.props.warningCount !== undefined && this.props.warningCount > 0 &&
                        <div>{`${this.props.warningCount} Warnings`}</div>
                    }
                    {this.props.remainingTime !== undefined && this.props.remainingTime > 0 &&
                        <div>{`${this.displayTime(this.props.remainingTime)} remaining`}</div>
                    }
                </div>
                <OF.Spinner size={OF.SpinnerSize.large} />
                <div className="cl-modal_footer cl-modal-buttons">
                    <div className="cl-modal-buttons_secondary" />
                    <div className="cl-modal-buttons_primary">
                        <OF.DefaultButton
                            onClick={this.props.onClose}
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
    open: boolean
    title: string
    index: number
    total: number
    warningCount?: number
    remainingTime?: number
    onClose: () => void
}

type Props = ReceivedProps & ReceivedProps & InjectedIntlProps

export default connect<{}, {}, ReceivedProps>(null)(injectIntl(ProgessModal))