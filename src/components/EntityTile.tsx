import * as React from 'react';
import { EntityBase } from 'blis-models'
export interface Props {
    item: EntityBase
}
const EntityTile: React.SFC<Props> = (props: Props) => {
    return (
        <div className='ms-ListItem is-selectable'>
            <span className='ms-ListItem-primaryText'>{props.item.entityName}</span>
        </div>
    );
}
export default EntityTile;