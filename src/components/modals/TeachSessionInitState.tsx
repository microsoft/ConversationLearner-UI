/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as CLM from '@conversationlearner/models'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import EntityCreatorEditor from './EntityCreatorEditor'
import FormattedMessageId from '../FormattedMessageId'
import MemorySetter from '../modals/MemorySetter'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../../types'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { FM } from '../../react-intl-messages'
import './TeachSessionInitState.css'

interface ComponentState {
    filledEntityMap: CLM.FilledEntityMap
    isEntityEditorModalOpen: boolean
}

class TeachSessionInitState extends React.Component<Props, ComponentState> {

    constructor(props: Props) {
        super(props)
        this.state = { 
            filledEntityMap: new CLM.FilledEntityMap(),
            isEntityEditorModalOpen: false,
        }
    }

    @OF.autobind
    onClickCreateEntity() {
        this.setState({
            isEntityEditorModalOpen: true
        })
    }

    @OF.autobind
    onCloseEntityEditor() {
        this.setState({
            isEntityEditorModalOpen: false
        })
    }

    @OF.autobind
    onClickCancel() {
        this.props.handleClose(null)
    }

    @OF.autobind
    onClickSubmit() {
        // Remove any empty items
        for (const entityName of Object.keys(this.state.filledEntityMap.map)) {
            const filledEntity = this.state.filledEntityMap.map[entityName]
            filledEntity.values = filledEntity.values.filter(entityValue => entityValue.userText !== '' || entityValue.enumValueId)
            if (filledEntity.values.length === 0) {
                delete this.state.filledEntityMap.map[entityName]
            }
        }

        this.props.handleClose(this.state.filledEntityMap)
    }

    @OF.autobind
    updateFilledEntityMap(map: { [key: string]: CLM.FilledEntity }) {
        this.setState({filledEntityMap: new CLM.FilledEntityMap({map: map})})
    }

    render() {
        return (
            <Modal
                isOpen={this.props.isOpen}
                isBlocking={true}
                containerClassName="cl-modal cl-modal--medium"
            >
                <div className="cl-modal_header">
                    <span className={OF.FontClassNames.xxLarge}>
                        <FormattedMessageId id={FM.TEACHSESSIONINIT_TITLE} />
                    </span>
                </div>
                <div>
                    <MemorySetter
                        map={this.state.filledEntityMap.map}
                        onUpdate={this.updateFilledEntityMap}
                    />  
                </div>
                <div className="cl-modal_footer cl-modal-buttons cl-modal_footer--border">
                    <div className="cl-modal-buttons_secondary">
                        <OF.DefaultButton
                            onClick={this.onClickCreateEntity}
                            ariaDescription="Create Entity"
                            text="Entity"
                            iconProps={{ iconName: 'CirclePlus' }}
                        />
                    </div>
                    <div className="cl-modal-buttons_primary">
                        <OF.PrimaryButton
                            data-testid="teach-session-ok-button"
                            onClick={this.onClickSubmit}
                            ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_OK)}
                            text={Util.formatMessageId(this.props.intl, FM.BUTTON_OK)}
                            iconProps={{ iconName: 'Accept' }}
                        />
                        <OF.DefaultButton
                            data-testid="teach-session-cancel-button"
                            onClick={this.onClickCancel}
                            ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_CANCEL)}
                            text={Util.formatMessageId(this.props.intl, FM.BUTTON_CANCEL)}
                            iconProps={{ iconName: 'Cancel' }}
                        />
                    </div>
                </div>
                <EntityCreatorEditor
                    app={this.props.app}
                    editingPackageId={this.props.editingPackageId}
                    open={this.state.isEntityEditorModalOpen}
                    entity={null}
                    handleClose={this.onCloseEntityEditor}
                    handleDelete={() => { }}
                    entityTypeFilter={null}
                />
            </Modal>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        entities: state.entities
    }
}

export interface ReceivedProps {
    isOpen: boolean,
    app: CLM.AppBase,
    editingPackageId: string
    handleClose: (filledEntityMap: CLM.FilledEntityMap | null) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TeachSessionInitState))
