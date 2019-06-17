/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { ActionButton } from 'office-ui-fabric-react'
import './Expando.css'

interface Props {
    isOpen: boolean,
    text: string,
    className: string
    onToggle: () => void
}

class Expando extends React.Component<Props, {}> {
    render() {
        return (
            <div 
                className={`cl-expando ${this.props.className}`} 
                onClick={this.props.onToggle}
                role="button"
            >
                <ActionButton
                    iconProps={this.props.isOpen ? { iconName: 'ChevronUpSmall' } : { iconName: 'ChevronDownSmall' }}
                    checked={true}
                >
                    {this.props.text}
                </ActionButton>
            </div>
        )
    }
}

export default Expando
