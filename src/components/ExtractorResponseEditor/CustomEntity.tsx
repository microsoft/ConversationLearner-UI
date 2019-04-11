/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import './CustomEntity.css'
import { IconButton } from 'office-ui-fabric-react'

// Simulate entity component props which have children
interface EntityComponentProps {
    children?: any
}

interface Props extends EntityComponentProps {
    name: string
    isDeleteButtonOpen: boolean
    readOnly: boolean
    onClickName: () => void
    onClickDelete: () => void
}

export const CustomEntity = (props: Props) => {
    const { name, isDeleteButtonOpen, readOnly } = props

    return (
        <span className={`cl-entity-node cl-entity-node--custom ${isDeleteButtonOpen ? 'cl-entity-node--is-editing' : ''} ${readOnly ? 'cl-entity-node--read-only' : ''}`}>
            <div className="cl-entity-node-indicator noselect">
                <div className="cl-entity-node-indicator__mincontent">
                    <div className="cl-entity-node-indicator__controls">
                        {isDeleteButtonOpen &&
                            <IconButton
                                className="ms-Button--headstone"
                                iconProps={{ iconName: 'Delete' }}
                                onClick={props.onClickDelete}
                                title="Unselect Entity"
                            />
                        }
                    </div>
                    <div className="cl-entity-node-indicator__name noselect" spellCheck={false}>
                        <button
                            className={isDeleteButtonOpen ? "cl-button-delete-open" : ""}
                            type="button"
                            data-testid="custom-entity-name-button"
                            onClick={props.onClickName}
                            tabIndex={-1}
                        >
                            {name}
                        </button>
                    </div>
                </div>
                <div className='cl-entity-node-indicator__bracket' />
            </div>
            <span
                className={`cl-entity-node__text${isDeleteButtonOpen ? " noselect" : ""}`}
                onClick={props.onClickName}
                role="button"
            >
                {props.children}
            </span>
        </span>
    )
}

export default CustomEntity