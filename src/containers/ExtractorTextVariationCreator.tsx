import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { UserInput } from 'blis-models'
import { State } from '../types';
import { TextFieldPlaceholder } from './TextFieldPlaceholder';
import { returntypeof } from 'react-redux-typescript';
import { runExtractorAsync } from '../actions/teachActions';

const initState = {
    variationValue: '',
};

interface ComponentState {
    variationValue: string
}

class ExtractorTextVariationCreator extends React.Component<Props, ComponentState> {
    constructor(p: Props) {
        super(p);
        this.state = initState;
        this.handleAddVariation = this.handleAddVariation.bind(this)
        this.textChanged = this.textChanged.bind(this)
    }
    textChanged(text: string) {
        this.setState({
            variationValue: text
        })
    }
    handleAddVariation() {
        let appId = this.props.apps.current.appId;
        let teachId = this.props.teachSessions.current.teachId;
        let userInput = new UserInput({ text: this.state.variationValue })
        this.props.runExtractorAsync(this.props.user.key, appId, teachId, userInput);
        this.setState({
            variationValue: ''
        })
    }
    render() {
        return (
            <div className='teachVariationBox'>
                <div className='teachAddVariation'>
                    <TextFieldPlaceholder
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
        teachSessions: state.teachSessions,
        user: state.user,
        apps: state.apps
    }
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect<typeof stateProps, typeof dispatchProps, {}>(mapStateToProps, mapDispatchToProps)(ExtractorTextVariationCreator as React.ComponentClass<any>);