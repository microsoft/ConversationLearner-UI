import * as React from 'react'
import PreBuiltEntity from './PreBuiltEntity'

/* Simulate entity component props which have children */
interface EntityComponentProps {
    node: any
    attributes: any
    children: any
}

interface Props extends EntityComponentProps {
}

export const PreBuiltEntityNode = (props: Props) => {
    const nodeData = props.node.data.toJS()
    const option = nodeData.option

    return (
        <PreBuiltEntity
            option={option}
            {...props.attributes}
        >
            {...props.children}
        </PreBuiltEntity>
    )
}

export default PreBuiltEntityNode