import * as React from 'react'
import './CustomEntity.css'

/* Simulate entity component props which have children */
interface EntityComponentProps {
    children?: any
}

interface Props extends EntityComponentProps {
    name: string
    isEditing: boolean
    readOnly: boolean
    onClickName: () => void
    onClickDelete: () => void
}

export const CustomEntity = (props: Props) => {
    const { name, isEditing, readOnly } = props
    
    return (
        <span className={`blis-entity-node blis-entity-node--custom ${isEditing ? 'blis-entity-node--is-editing' : ''} ${readOnly ? 'blis-entity-node--read-only' : ''}`}>
            <div className="blis-entity-node-indicator noselect">
                <div className="blis-entity-node-indicator__mincontent">
                    <div className="blis-entity-node-indicator__controls">
                        {isEditing && <button type="button" onClick={props.onClickDelete}>&#10006;</button>}
                    </div>
                    <div className="blis-entity-node-indicator__name noselect" spellCheck={false}>
                        <button type="button" onClick={props.onClickName} tabIndex={-1}>
                            {name}
                        </button>
                    </div>
                </div>
                <div className="blis-entity-node-indicator__bracket">
                </div>
            </div>
            <span className="blis-entity-node__text" onClick={props.onClickName}>
                {props.children}
            </span>
        </span>
    )
}

export default CustomEntity