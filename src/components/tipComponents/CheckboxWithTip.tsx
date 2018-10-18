/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { TipType } from '../ToolTips/ToolTips'
import HelpIcon from '../HelpIcon'
import * as OF from 'office-ui-fabric-react'
import "./CheckboxWithTip.css"

export interface ICheckboxWithTipProps extends OF.ICheckboxProps {
    tipType: TipType
}

export default function component (props: ICheckboxWithTipProps) {
    const { tipType, className, ...rest } = props
    return (
        <div data-testid={props['data-testid']}>
            <OF.Checkbox
                {...rest}
                className={`cl-checkbox ${className}`}
            />
            <HelpIcon tipType={tipType} />
        </div>
    )
}
