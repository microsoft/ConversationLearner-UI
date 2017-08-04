import { editActionAsync } from '../actions/updateActions';
import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types';

class ExtractorTextVariationCreator extends React.Component<any, any> {
    render() {
        return (
            <div >
                 ExtractorTextVariationCreator
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        editActionAsync: editActionAsync,
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        entities: state.entities
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ExtractorTextVariationCreator as React.ComponentClass<any>);