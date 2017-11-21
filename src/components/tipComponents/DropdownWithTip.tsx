import * as React from 'react';
import { connect } from 'react-redux';
import { TipType } from '../../components/ToolTips';
import HelpIcon from '../HelpIcon'
import * as OF from 'office-ui-fabric-react';

class DropdownWithTip extends OF.BaseComponent<IDropdownWithTipProps, OF.IDropdownState> {

    constructor(props: IDropdownWithTipProps) {
        super(props)
    }
    render() {
        return (
            <div>
                <OF.Label>{this.props.label}
                    <HelpIcon tipType={this.props.tipType} />
                </OF.Label>
                <OF.Dropdown
                    className={this.props.hasButton ? 'blis-dropdownWithButton-dropdown' : ''}
                    label={null}
                    options={this.props.options}
                    onChanged={this.props.onChanged}
                    selectedKey={this.props.selectedKey}
                    disabled={this.props.disabled}
                    placeHolder={this.props.placeHolder}
                />
            </div>
        )
    }
}

export interface IDropdownWithTipProps extends OF.IDropdownProps {
    tipType: TipType
    hasButton?: boolean

}

export default connect<IDropdownWithTipProps>(null, null)(DropdownWithTip);