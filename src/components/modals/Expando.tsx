/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { connect } from 'react-redux'
import { ActionButton } from 'office-ui-fabric-react'
import './Expando.css'

class Expando extends React.Component<Props, {}> {
    render() {
        return (
            <div className={`cl-expando ${this.props.className}`} onClick={this.props.onToggle}>
                <ActionButton
                    iconProps={ this.props.isOpen ? { iconName: 'ChevronUpSmall' } : { iconName: 'ChevronDownSmall' }}
                    checked={ true }
                >
                    {this.props.text}
                </ActionButton>
            </div>
        )
    }
}

export interface ReceivedProps {
    isOpen: boolean,
    text: string,
    className: string
    onToggle: () => void
}

type Props = ReceivedProps

export default connect<ReceivedProps>(null, null)(Expando)
