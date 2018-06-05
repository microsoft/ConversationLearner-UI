/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { TipType } from '../../components/ToolTips'
import HelpIcon from '../HelpIcon'
import * as OF from 'office-ui-fabric-react'

export interface IDropdownWithTipProps extends OF.IDropdownProps {
    tipType: TipType
}

class DropdownWithTip extends OF.BaseComponent<IDropdownWithTipProps, OF.IDropdownState> {
    render() {
        const { label, tipType, ...dropdownProps } = this.props

        return (
            <div>
                <OF.Label>{label}
                    <HelpIcon tipType={tipType} />
                </OF.Label>
                <OF.Dropdown
                    {...dropdownProps}
                    label={null}
                />
            </div>
        )
    }
}

export default DropdownWithTip