/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import PreBuiltEntity from './PreBuiltEntity'
import { IGenericEntityData } from './models'

/* Simulate entity component props which have children */
interface EntityComponentProps {
    node: any
    attributes: any
    children: any
}

interface Props extends EntityComponentProps {
}

export const PreBuiltEntityNode = (props: Props) => {
    const nodeData: IGenericEntityData<any> = props.node.data.toJS()

    return (
        <PreBuiltEntity
            name={nodeData.displayName}
            {...props.attributes}
        >
            {...props.children}
        </PreBuiltEntity>
    )
}

export default PreBuiltEntityNode