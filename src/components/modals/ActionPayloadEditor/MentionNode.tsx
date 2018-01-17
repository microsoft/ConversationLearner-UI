import * as React from 'react'
import './MentionNode.css'

/* Simulate entity component props which have children */
interface EntityComponentProps {
    node: any
    attributes: any
    children: any
}

interface Props extends EntityComponentProps {
}

export const MentionNode = (props: Props) => {
    const isCompleted = props.node.data.get('completed')

    return (
        <span className={`mention-node ${isCompleted ? 'mention-node--completed' : ''}`} {...props.attributes}>
            {props.children}
        </span>
    )
}

export default MentionNode