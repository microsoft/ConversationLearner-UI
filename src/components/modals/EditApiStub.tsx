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
import HelpIcon from '../HelpIcon'
import MemorySetter from './MemorySetter'
import { TipType } from '../ToolTips/ToolTips'
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
    apiNameVal: string
    // If editing an is exiting api stub
    isNameFixed: boolean
}

class EditApiStub extends React.Component<Props, ComponentState> {

    constructor(props: Props) {
        super(props)
        this.state = { 
            filledEntityMap: new CLM.FilledEntityMap(),
            isEntityEditorModalOpen: false,
            apiNameVal: '',
            isNameFixed: false
        }
    }

    componentWillReceiveProps(newProps: Props) {
        if (this.props.isOpen !== newProps.isOpen) {
            this.setState({
                filledEntityMap: newProps.initMemories || new CLM.FilledEntityMap(),
                apiNameVal: newProps.apiStubName || '',
                isNameFixed: newProps.apiStubName !== null
            })
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
        this.props.handleClose(null, null)
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

        this.props.handleClose(this.state.filledEntityMap, this.state.apiNameVal)
    }

    @OF.autobind
    onChangedName(text: string) {
        this.setState({
            apiNameVal: text
        })
    }

    onGetNameErrorMessage(value: string): string {
        // Don't need to check if editing existing API stub
        if (this.state.isNameFixed) {
            return ''
        }

        const MAX_NAME_LENGTH = 30

        if (value.length === 0) {
            return Util.formatMessageId(this.props.intl, FM.FIELDERROR_REQUIREDVALUE)
        }

        if (value.length > MAX_NAME_LENGTH) {
            return Util.formatMessageId(this.props.intl, FM.FIELDERROR_MAX_30)
        }

        if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
            return Util.formatMessageId(this.props.intl, FM.FIELDERROR_ALPHANUMERIC)
        }

        if (this.props.actions.filter(a => CLM.ActionBase.isStubbedAPI(a))
            .map(aa => new CLM.ApiAction(aa))
            .find(aaa => aaa.name === value)) {
                return Util.formatMessageId(this.props.intl, FM.FIELDERROR_DISTINCT)
            }

        return ''
    }

    isSaveDisabled(): boolean {
        return (this.onGetNameErrorMessage(this.state.apiNameVal) !== '')
    }

    @OF.autobind
    updateFilledEntityMap(map: { [key: string]: CLM.FilledEntity }) {
        this.setState({filledEntityMap: new CLM.FilledEntityMap({map: map})})
    }

    render() {
        const { intl } = this.props
        return (
            <Modal
                isOpen={this.props.isOpen}
                isBlocking={true}
                containerClassName="cl-modal cl-modal--medium"
            >
                <div className="cl-modal_header">
                    <span className={OF.FontClassNames.xxLarge}>
                        <FormattedMessageId id={FM.TEACHSESSIONSTUB_TITLE}/>
                    </span>
                </div>
                <div>
                    <div className="cl-init-state-fields cl-ux-flexpanel--left">
                        <OF.TextField
                            className={OF.FontClassNames.mediumPlus}
                            readOnly={this.state.isNameFixed}
                            onChanged={(text) => this.onChangedName(text)}
                            label={Util.formatMessageId(intl, FM.SETTINGS_FIELDS_NAMELABEL)}
                            onGetErrorMessage={value => this.onGetNameErrorMessage(value)}
                            value={this.state.apiNameVal}
                        />
                        <div className={OF.FontClassNames.mediumPlus}>
                            <FormattedMessageId id={FM.TEACHSESSIONSTUB_DESCRIPTION}/>
                            <HelpIcon tipType={TipType.STUB_API}/>
                        </div>
                    </div>
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
                            disabled={this.isSaveDisabled()}
                            ariaDescription={intl.formatMessage({
                                id: FM.BUTTON_OK,
                                defaultMessage: 'Ok'
                            })}
                            text={intl.formatMessage({
                                id: FM.BUTTON_OK,
                                defaultMessage: 'Ok'
                            })}
                            iconProps={{ iconName: 'Accept' }}
                        />
                        <OF.DefaultButton
                            data-testid="teach-session-cancel-button"
                            onClick={this.onClickCancel}
                            ariaDescription={intl.formatMessage({
                                id: FM.BUTTON_CANCEL,
                                defaultMessage: 'Cancel'
                            })}
                            text={intl.formatMessage({
                                id: FM.BUTTON_CANCEL,
                                defaultMessage: 'Cancel'
                            })}
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
    actions: CLM.ActionBase[],
    apiStubName: string | null
    editingPackageId: string
    initMemories: CLM.FilledEntityMap | null
    handleClose: (filledEntityMap: CLM.FilledEntityMap | null, apiName: string | null) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(EditApiStub))
