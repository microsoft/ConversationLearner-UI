import * as React from 'react'
import './CustomEntity.css'

/* Simulate entity component props which have children */
interface EntityComponentProps {
    children?: any
}

interface Props extends EntityComponentProps {
    name: string
}

export const CustomEntity = (props: Props) => {
    const { name } = props
    return (
        <span className="blis-entity-node blis-entity-node--prebuilt">
            <div className="blis-entity-node-indicator noselect">
                <div className="blis-entity-node-indicator__mincontent">
                    <div className="blis-entity-node-indicator__name">
                        {name}
                    </div>
                </div>
                <div className="blis-entity-node-indicator__bracket">
                </div>
            </div>
            <span className="blis-entity-node__text">
                {props.children}
            </span>
        </span>
    )
}

export default CustomEntity