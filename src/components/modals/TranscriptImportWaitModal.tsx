/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import { connect } from 'react-redux'
import './TranscriptImportWaitModal.css'

interface ComponentState {
    userInputVal: string
}

class TranscriptImportWaitModal extends React.Component<Props, ComponentState> {

    render() {
        return (
            <OF.Modal
                isOpen={true}
                isBlocking={true}
                containerClassName='cl-modal cl-modal--importwait'
            >
                    <div className={`cl-dialog-title cl-dialog-title--import cl-transcript-import-wait-body ${OF.FontClassNames.xxLarge}`}>
                        <OF.Icon
                            iconName='DownloadDocument'
                        />
                        {`Importing ${this.props.importIndex} of ${this.props.importCount}...`}
                    </div>
            </OF.Modal>
        )
    }
}

export interface ReceivedProps {
    importIndex?: number
    importCount?: number
}

type Props = ReceivedProps 

export default connect<{}, {}, ReceivedProps>(null)(TranscriptImportWaitModal)