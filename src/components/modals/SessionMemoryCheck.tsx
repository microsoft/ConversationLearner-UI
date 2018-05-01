/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import * as OF from 'office-ui-fabric-react';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { Memory } from '@conversationlearner/models'
import MemoryTable from './MemoryTable';
import './EntityCreatorEditor.css'
import { FM } from '../../react-intl-messages'

class SessionMemoryCheck extends React.Component<Props, {}> {
  
    render() {
        const { intl } = this.props
        return (
            <Modal
                isOpen={this.props.open}
                isBlocking={false}
                containerClassName="cl-modal cl-modal--wide"
            >
                <MemoryTable
                    memories={this.props.memories}
                    prevMemories={[]}
                />

                <span className={`cl-label--padded ${OF.FontClassNames.large}`}>
                    <FormattedMessage
                        id={FM.SESSIONMEMORYCHECK_DESCRIPTION_ARIADESCRIPTION}
                        defaultMessage={FM.SESSIONMEMORYCHECK_DESCRIPTION_ARIADESCRIPTION}
                    />
                </span>

                <OF.DialogFooter>
                    <OF.PrimaryButton
                        onClick={() => this.props.onClose(true)}
                        ariaDescription={intl.formatMessage({
                            id: FM.SESSIONMEMORYCHECK_KEEPBUTTON_ARIADESCRIPTION,
                            defaultMessage: 'Keep'
                        })}
                        text={intl.formatMessage({
                            id: FM.SESSIONMEMORYCHECK_KEEPBUTTON_TEXT,
                            defaultMessage: 'Keep'
                        })}
                    />
                    <OF.DefaultButton
                        onClick={() => this.props.onClose(false)}
                        ariaDescription={intl.formatMessage({
                            id: FM.SESSIONMEMORYCHECK_CLEARBUTTON_ARIADESCRIPTION,
                            defaultMessage: 'Clear'
                        })}
                        text={intl.formatMessage({
                            id: FM.SESSIONMEMORYCHECK_CLEARBUTTON_TEXT,
                            defaultMessage: 'Clear'
                        })}
                    />
                </OF.DialogFooter>
            </Modal>
        )
    }
}

export interface ReceivedProps {
    open: boolean,
    memories: Memory[],
    onClose: (saveMemory: boolean) => void
}

type Props =  ReceivedProps & InjectedIntlProps

export default connect<ReceivedProps>(null, null)(injectIntl(SessionMemoryCheck))