import * as React from 'react'
import { IOption } from './models'
import './CustomEntity.css'

/* Simulate entity component props which have children */
interface EntityComponentProps {
    children?: any
}

interface Props extends EntityComponentProps {
    option: IOption
}

export const CustomEntity = (props: Props) => {
    const { option } = props
    return (
        <span className="blis-entity-node blis-entity-node--prebuilt">
            <div className="blis-entity-node-indicator noselect">
                <div className="blis-entity-node-indicator__mincontent">
                    <div className="blis-entity-node-indicator__name">
                        {option.name}
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