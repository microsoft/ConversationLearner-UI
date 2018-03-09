import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { fetchApplicationTrainingStatusThunkAsync } from '../../actions/fetchActions'
import { createEntityAsync } from '../../actions/createActions';
import { editEntityAsync } from '../../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import * as OF from 'office-ui-fabric-react';
import { State } from '../../types';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { Memory } from 'blis-models'
import MemoryTable from './MemoryTable';
import './EntityCreatorEditor.css'
import { FM } from '../../react-intl-messages'

class SessionMemoryCheck extends React.Component<Props, {}> {
  
    render() {
        const { intl } = this.props
        return (
            <Modal
                isOpen={this.props.open}
                isBlocking={false}
                containerClassName="blis-modal blis-modal--wide blis-modal--border"
            >

                <MemoryTable
                    memories={this.props.memories}
                    prevMemories={[]}
                />

                <span className={`blis-label--padded ${OF.FontClassNames.large}`}>
                    <FormattedMessage
                        id={FM.SESSIONMEMORYCHECK_DESCRIPTION_ARIADESCRIPTION}
                        defaultMessage={FM.SESSIONMEMORYCHECK_DESCRIPTION_ARIADESCRIPTION}
                    />
                </span>

                <OF.DialogFooter>
                    <OF.PrimaryButton
                        onClick={() => this.props.onClose(true)}
                        ariaDescription={intl.formatMessage({
                            id: FM.SESSIONMEMORYCHECK_KEEPBUTTON_ARIADESCRIPTION,
                            defaultMessage: 'Keep'
                        })}
                        text={intl.formatMessage({
                            id: FM.SESSIONMEMORYCHECK_KEEPBUTTON_TEXT,
                            defaultMessage: 'Keep'
                        })}
                    />
                    <OF.DefaultButton
                        onClick={() => this.props.onClose(false)}
                        ariaDescription={intl.formatMessage({
                            id: FM.SESSIONMEMORYCHECK_CLEARBUTTON_ARIADESCRIPTION,
                            defaultMessage: 'Clear'
                        })}
                        text={intl.formatMessage({
                            id: FM.SESSIONMEMORYCHECK_CLEARBUTTON_TEXT,
                            defaultMessage: 'Clear'
                        })}
                    />
                </OF.DialogFooter>
            </Modal>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createEntityAsync,
        editEntityAsync,
        fetchApplicationTrainingStatusThunkAsync
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        user: state.user,
        entities: state.entities,
        actions: state.actions,
    }
}

export interface ReceivedProps {
    open: boolean,
    memories: Memory[],
    onClose: (saveMemory: boolean) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(SessionMemoryCheck))