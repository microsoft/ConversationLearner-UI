import * as React from 'react';

export interface Item {
    key: string
    text: string
}

export interface Props {
    item: Item;
	onClick: Function;
}
const AutocompleteListItem: React.SFC<Props> = (props: Props) => {
    return (
        <div data-is-focusable={true} onClick={() => props.onClick()} className='autoCompleteListItem'>
            <span className='ms-font-m'>{props.item.text}</span>
        </div>
    );
}
export default AutocompleteListItem;