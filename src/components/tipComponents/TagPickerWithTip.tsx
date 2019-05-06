/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { TipType } from '../ToolTips/ToolTips'
import HelpIcon from '../HelpIcon'
import * as OF from 'office-ui-fabric-react'

const testIdAttribute = 'data-testid'
export interface ITagPickerWithTipProps extends OF.ITagPickerProps {
    label: string;
    tipType: TipType;
}

export default function component(props: ITagPickerWithTipProps) {
    const { label, tipType, ...pickerProps } = props
    return (
        <div data-testid={props[testIdAttribute]}>
            <OF.Label className="cl-label">{label}
                <HelpIcon tipType={tipType} />
            </OF.Label>
            <OF.TagPicker
                {...pickerProps}
            />
        </div>
    )
}
