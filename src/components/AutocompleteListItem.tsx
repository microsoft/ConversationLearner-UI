/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import './AutocompleteListItem.css'
import { FontClassNames } from 'office-ui-fabric-react'

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
            <span className={FontClassNames.medium}>{props.item.text}</span>
        </div>
    );
}
export default AutocompleteListItem;