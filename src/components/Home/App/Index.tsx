import * as React from 'react'
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { counterAdd, counterDecrement } from '../../../actions/counterActions';
import { State } from '../../../types';

const component: React.SFC<Props> = ({ counterAdd, counterDecrement, counter }) => (
    <div className="blis-page">
        <h1 className="ms-font-xxl">Overview</h1>
        <p className="ms-font-m-plus">Facts & statistics about the app's data at any period of time...</p>

        <div>
            <div>{counter.value}</div>
            <button type="button" onClick={() => counterAdd(1)}>Increment</button>
            <button type="button" onClick={() => counterDecrement(1)}>Decrement</button>
        </div>
    </div>
)

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        counterAdd,
        counterDecrement
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        counter: state.counter
    }
}

interface ReceivedProps {
    app: any
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(component);
