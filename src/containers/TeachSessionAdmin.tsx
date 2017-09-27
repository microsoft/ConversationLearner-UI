import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { TeachMode } from '../types/const';
import { BlisAppBase } from 'blis-models'
import TeachSessionScorer from './TeachSessionScorer';
import TeachSessionExtractor from './TeachSessionExtractor';
import TeachSessionMemory from './TeachSessionMemory';

class TeachSessionAdmin extends React.Component<Props, any> {
    render() {
        let userWindow = null;
        switch (this.props.teachSession.mode) {
            case TeachMode.Extractor:
                userWindow = (
                    <div>
                        <TeachSessionMemory />
                        <TeachSessionExtractor />
                    </div>
                )
                break;
            case TeachMode.Scorer:
                userWindow = (
                    <div>
                        <TeachSessionMemory />
                        <TeachSessionExtractor />
                        <TeachSessionScorer />
                    </div>
                )
                break;
            default:
                // If in auto mode show all windows as long as there's at least one round
                if (this.props.teachSession.autoTeach && this.props.teachSession.currentConversationStack.length > 0) {
                    userWindow = (
                        <div>
                            <TeachSessionMemory />
                            <TeachSessionExtractor />
                            <TeachSessionScorer />
                        </div>
                    )
                }
                else {
                    userWindow = (
                        <div>
                            <TeachSessionMemory />
                        </div>
                    )
                }
                break;
        }
        return (
            <div>
                {userWindow}
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        teachSession: state.teachSessions
    }
}

export interface ReceivedProps {
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(TeachSessionAdmin);