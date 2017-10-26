import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { UserInput, DialogType } from 'blis-models'
import { State } from '../types';
import { returntypeof } from 'react-redux-typescript';
import { runExtractorAsync } from '../actions/teachActions';
import { TextField } from 'office-ui-fabric-react';

const initState = {
    variationValue: '',
};

interface ComponentState {
    variationValue: string
}

class TextVariationCreator extends React.Component<Props, ComponentState> {
    constructor(p: Props) {
        super(p);
        this.state = initState;
        this.handleAddVariation = this.handleAddVariation.bind(this)
        this.textChanged = this.textChanged.bind(this)
    }
    textChanged(text: string) {
        this.props.onTextChanged(text);
        this.setState({
            variationValue: text
        })
    }
    handleAddVariation() {
        let userInput = new UserInput({ text: this.state.variationValue })
        this.props.runExtractorAsync(
            this.props.user.key, this.props.appId, this.props.extractType, 
            this.props.sessionId, this.props.roundIndex, userInput);
        this.setState({
            variationValue: ''
        })
        this.props.onAddVariation();
    }
    render() {
        return (
            <div className='teachVariationBox'>
                <div className='teachAddVariation'>
                    <TextField
                        value={this.state.variationValue}
                        onChanged={this.textChanged}
                        placeholder="Add alternative input..."
                        onKeyPress={(ev) => {
                            if (ev.key === 'Enter') {
                                this.handleAddVariation();
                                ev.preventDefault();
                            }
                        }}
                    />
                </div>
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        runExtractorAsync
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        user: state.user,
    }
}

export interface ReceivedProps {
    appId: string,
    sessionId: string,
    extractType: DialogType
    roundIndex: number,
    onAddVariation: ()=>void
    onTextChanged: (text: string)=>void;
 }

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(TextVariationCreator);