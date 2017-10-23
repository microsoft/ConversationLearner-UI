import * as React from 'react';
import { IPickerItemProps, Icon } from 'office-ui-fabric-react'

export interface IBlisTag {
  key: string;
  name: string;
  locked?: boolean; // TEMPL go away?
  strike?: boolean;
}

export interface IBlisPickerItemProps<T> extends IPickerItemProps<T> {
    locked: boolean;
    strike: boolean;
}
export const BlisTagItem = (props: IBlisPickerItemProps<IBlisTag>) => (
    <div
      className={ 'ms-TagItem'}
      key={ props.index }
      data-selection-index={ props.index }
      data-is-focusable={ !props.disabled && true }
    >
      {props.strike ?
        <span className={'ms-TagItem-text ms-TagItem-text--strike'} aria-label={ props.children }>{ props.children }</span>
        :
        <span className={'ms-TagItem-text'} aria-label={ props.children }>{ props.children }</span>   
      }
      { !props.disabled && !props.locked &&
        <span className={'ms-TagItem-close'} onClick={ props.onRemoveItem }>
          <Icon iconName='Cancel' />
        </span>
      }
    </div>
  );

  export default BlisTagItem;