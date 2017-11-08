import * as React from 'react';
import { connect } from 'react-redux';
import { TipType } from '../../components/ToolTips';
import HelpIcon from '../HelpIcon'
import * as OF from 'office-ui-fabric-react';

class TagPickerWithTip extends OF.BaseComponent<ITagPickerWithTipProps, {}> {
    
    constructor(props: ITagPickerWithTipProps) {
        super(props)
    }
    render() {
        return (
            <div>
                <OF.Label>{this.props.label}
                    <HelpIcon tipType={this.props.tipType}/>
                </OF.Label>
                <OF.TagPicker
                    onResolveSuggestions={this.props.onResolveSuggestions}
                    onRenderItem={this.props.onRenderItem}
                    getTextFromItem={this.props.getTextFromItem}
                    onChange={this.props.onChange}
                    pickerSuggestionsProps={this.props.pickerSuggestionsProps}
                    selectedItems={this.props.selectedItems}
                />
            </div>
        )
    }
}

export interface ITagPickerWithTipProps extends OF.ITagPickerProps {
    label: string;
    tipType: TipType;
}

export default connect<ITagPickerWithTipProps>(null, null)(TagPickerWithTip);