/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import { connect } from 'react-redux'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import './ImportWaitModal.css'

interface ComponentState {
    userInputVal: string
}

class ImportWaitModal extends React.Component<Props, ComponentState> {

    render() {
        return (
            <Modal
                isOpen={true}
                isBlocking={true}
                containerClassName='cl-modal cl-modal--importwait'
            >
                    <div className={`cl-dialog-title cl-dialog-title--import cl-import-wait-body ${OF.FontClassNames.xxLarge}`}>
                        <OF.Icon
                            iconName='DownloadDocument'
                        />
                        {`Importing ${this.props.importIndex} of ${this.props.importCount}...`}
                    </div>
            </Modal>
        )
    }
}

export interface ReceivedProps {
    importIndex?: number
    importCount?: number
}

type Props = ReceivedProps 

export default connect<null, null, ReceivedProps>(null, null)(ImportWaitModal)