/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { TipType } from '../../components/ToolTips'
import HelpIcon from '../HelpIcon'
import * as OF from 'office-ui-fabric-react'

export interface ITagPickerWithTipProps extends OF.ITagPickerProps {
    label: string;
    tipType: TipType;
}

export default function component(props: ITagPickerWithTipProps) {
    const { label, tipType, ...pickerProps } = props
    return (
        <div>
            <OF.Label>{label}
                <HelpIcon tipType={tipType} />
            </OF.Label>
            <OF.TagPicker
                {...pickerProps}
            />
        </div>
    )
}
