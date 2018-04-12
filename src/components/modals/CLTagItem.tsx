import * as React from 'react';
import { IPickerItemProps, Icon, ITag } from 'office-ui-fabric-react'

export interface ICLPickerItemProps<T> extends IPickerItemProps<T> {
    locked: boolean;
    strike: boolean;
    highlight: boolean;
}
export const CLTagItem = (props: ICLPickerItemProps<ITag>) => (
    <div
        className={`ms-TagItem ${props.highlight ? 'ms-TagItem-text--highlight' : ''}`}
        data-selection-index={props.index}
        data-is-focusable={!props.disabled && true}
    >
        <span
            className={`ms-TagItem-text ${props.strike ? 'ms-TagItem-text--strike' : ''}`}
            aria-label={props.children.toString()}
        >
            {props.children}
        </span>
        {!props.disabled && !props.locked &&
            <span className={'ms-TagItem-close'} onClick={props.onRemoveItem}>
                <Icon iconName='Cancel' />
            </span>
        }
    </div>
);

export default CLTagItem;