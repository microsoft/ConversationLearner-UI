/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import './CustomEntity.css'

// Simulate entity component props which have children
interface EntityComponentProps {
    children?: any
}

interface Props extends EntityComponentProps {
    name: string
    showSelect: boolean
}

export const PreBuiltEntity = (props: Props) => {
    const { name, showSelect } = props
    const className = showSelect ? "cl-entity-node cl-entity-node--prebuilt" : "cl-entity-node cl-entity-node--custom"
    return (
        <span className={className}>
            <div className="cl-entity-node-indicator noselect">
                <div className="cl-entity-node-indicator__mincontent">
                    <div className="cl-entity-node-indicator__name">
                        {name}
                    </div>
                </div>
                <div className="cl-entity-node-indicator__bracket" />
            </div>
            <span className="cl-entity-node__text">
                {props.children}
            </span>
        </span>
    )
}

export default PreBuiltEntity