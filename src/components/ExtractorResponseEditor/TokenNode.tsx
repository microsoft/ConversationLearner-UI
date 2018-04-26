/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import './TokenNode.css'

/* Simulate entity component props which have children */
interface EntityComponentProps {
    editor: any
    node: any
    attributes: any
    children: any
    readOnly: boolean
}

interface Props extends EntityComponentProps {
}

class TokenNode extends React.Component<Props, {}> {
    onMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
        const detail = (event as any).detail
        if (detail > 1) {
            event.preventDefault()
            return false
        }

        return true
    }

    render() {
        return (
            <span className="cl-token-node" {...this.props.attributes} onMouseDown={this.onMouseDown}>
                {...this.props.children}
            </span>
        )
    }
}

export default TokenNode