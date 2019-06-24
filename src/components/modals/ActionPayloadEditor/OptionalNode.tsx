/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import './OptionalNode.css'

// Simulate entity component props which have children */
interface EntityComponentProps {
    node: any
    attributes: any
    children: any
}

interface Props extends EntityComponentProps {
}

export const OptionalNode = (props: Props) => {
    return (
        <span className="optional-node">
            {props.children}
        </span>
    )
}

export default OptionalNode