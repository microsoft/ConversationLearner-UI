import * as React from 'react';
import { Entity } from '../models/Entity'
export interface Props {
    item: Entity
}
const EntityTile = (props: Props) => {
    return (
        <div className='ms-ListItem is-selectable'>
            <span className='ms-ListItem-primaryText'>{props.item.name}</span>
        </div>
    );
}
export default EntityTile;