/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import * as CLM from '@conversationlearner/models'
import actions from '../../actions'
import FormattedMessageId from '../FormattedMessageId'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../../types'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { autobind } from 'core-decorators'
import HelpIcon from '../HelpIcon';
import { TipType } from '../ToolTips/ToolTips'

export enum DispatcherAlgorithmType {
    DeterministicSingleTransfer = "Deterministic Single Transfer",
    RandomSingleTransfer = 'Random Single Transfer',
    RandomMultiTransfer = 'Random Multi Transfer',
    TestData = 'Test Data',
}

interface ComponentState {
    modelName: string
    dispatcherAlgorithmType: DispatcherAlgorithmType
}

const initialState: ComponentState = {
    modelName: '',
    dispatcherAlgorithmType: DispatcherAlgorithmType.DeterministicSingleTransfer,
}

class Component extends React.Component<Props, ComponentState> {
    state: ComponentState = { ...initialState }

    componentDidUpdate(prevProps: Props) {
        // Reset when opening modal
        if (this.props.open === false && prevProps.open === true) {
            this.setState(initialState)
        }
    }

    @autobind
    onChangeName(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, modelName: string) {
        this.setState({
            modelName
        })
    }

    @autobind
    onClickCancel() {
        this.props.onCancel()
    }

    @autobind
    onClickCreate() {
        const isSubmitDisabled = this.isSubmitDisabled()
        if (isSubmitDisabled === false) {
            const model = this.getModelFromState()
            this.props.onSubmit(model, this.state.dispatcherAlgorithmType)
        }
    }

    onGetNameErrorMessage(value: string): string {
        const { intl } = this.props
        const MAX_NAME_LENGTH = 30

        if (value.length === 0) {
            return Util.formatMessageId(intl, FM.FIELDERROR_REQUIREDVALUE)
        }

        if (value.length > MAX_NAME_LENGTH) {
            return Util.formatMessageId(intl, FM.FIELDERROR_MAX_30)
        }

        if (!/^[a-zA-Z0-9- ]+$/.test(value)) {
            return Util.formatMessageId(intl, FM.APPCREATOR_FIELDERROR_ALPHANUMERIC)
        }

        if (!value.trim().length) {
            return Util.formatMessageId(intl, FM.APPCREATOR_FIELDERROR_ALPHANUMERIC)
        }

        // Check that name isn't in use
        if (this.props.apps.find(a => a.appName === value)) {
            return Util.formatMessageId(intl, FM.FIELDERROR_DISTINCT)
        }

        return ""
    }

    isSubmitDisabled(): boolean {
        return this.onGetNameErrorMessage(this.state.modelName) !== ""
    }

    @autobind
    onChoiceChange(ev: React.FormEvent<HTMLInputElement>, option?: OF.IChoiceGroupOption) {
        if (!option) {
            return
        }

        this.setState({ dispatcherAlgorithmType: option.key as DispatcherAlgorithmType })
    }

    render() {
        const { intl } = this.props
        return (
            <OF.Modal
                isOpen={this.props.open}
                onDismiss={this.onClickCancel}
                isBlocking={false}
                containerClassName='cl-modal cl-modal--small'
            >
                <div className='cl-modal_header'>
                    <span className={OF.FontClassNames.xxLarge}>
                        <FormattedMessageId id={FM.APPCREATOR_DISPATCHER_TITLE} />
                    </span>
                </div>
                <div className="cl-action-creator-fieldset">
                    <OF.TextField
                        data-testid="dispatcher-creator-input-name"
                        onGetErrorMessage={value => this.onGetNameErrorMessage(value)}
                        onChange={this.onChangeName}
                        label={Util.formatMessageId(intl, FM.APPCREATOR_FIELDS_NAME_LABEL)}
                        placeholder={Util.formatMessageId(intl, FM.APPCREATOR_FIELDS_NAME_PLACEHOLDER)}
                        value={this.state.modelName}
                    />

                    <div>
                        <div className={OF.FontClassNames.medium}>
                            <FormattedMessageId id={FM.DISPATCHCREATOR_ALGORITHM_TYPE_LABEL} />
                            <HelpIcon tipType={TipType.DISPATCHER_CREATOR_ALGORITHM_TYPE} />
                        </div>
                        <OF.ChoiceGroup
                            className="defaultChoiceGroup"
                            defaultSelectedKey={DispatcherAlgorithmType.DeterministicSingleTransfer}
                            options={[
                                {
                                    key: DispatcherAlgorithmType.DeterministicSingleTransfer,
                                    text: DispatcherAlgorithmType.DeterministicSingleTransfer
                                },
                                {
                                    key: DispatcherAlgorithmType.RandomSingleTransfer,
                                    text: DispatcherAlgorithmType.RandomSingleTransfer
                                },
                                {
                                    key: DispatcherAlgorithmType.RandomMultiTransfer,
                                    text: DispatcherAlgorithmType.RandomMultiTransfer
                                },
                                {
                                    key: DispatcherAlgorithmType.TestData,
                                    text: DispatcherAlgorithmType.TestData
                                },
                            ]}
                            selectedKey={this.state.dispatcherAlgorithmType}
                            onChange={this.onChoiceChange}
                            required={false}
                        />
                    </div>

                </div>
                <div className='cl-modal_footer'>
                    <div className="cl-modal-buttons">
                        <div className="cl-modal-buttons_secondary" />
                        <div className="cl-modal-buttons_primary">
                            <OF.PrimaryButton
                                disabled={this.isSubmitDisabled()}
                                data-testid="dispatcher-creator-submit-button"
                                onClick={this.onClickCreate}
                                ariaDescription={Util.formatMessageId(intl, FM.BUTTON_CREATE)}
                                text={Util.formatMessageId(intl, FM.BUTTON_CREATE)}
                                iconProps={{ iconName: 'Accept' }}
                            />

                            <OF.DefaultButton
                                data-testid="dispatcher-creator-cancel-button"
                                onClick={this.onClickCancel}
                                ariaDescription={Util.formatMessageId(intl, FM.APPCREATOR_CANCELBUTTON_ARIADESCRIPTION)}
                                text={Util.formatMessageId(intl, FM.APPCREATOR_CANCELBUTTON_TEXT)}
                                iconProps={{ iconName: 'Cancel' }}
                            />
                        </div>
                    </div>
                </div>
            </OF.Modal>
        )
    }
 
    private getModelFromState(): Partial<CLM.AppBase> {
        return {
            appName: this.state.modelName.trim(),
            locale: 'en-us',
            metadata: {
                botFrameworkApps: [],
                markdown: undefined,
                video: undefined,
                isLoggingOn: true,
            }
        }
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setErrorDisplay: actions.display.setErrorDisplay,
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        apps: state.apps.all
    }
}

export interface ReceivedProps {
    open: boolean
    onSubmit: (model: Partial<CLM.AppBase>, algorithmType: DispatcherAlgorithmType) => void
    onCancel: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
type stateProps = ReturnType<typeof mapStateToProps>;
type dispatchProps = ReturnType<typeof mapDispatchToProps>;
type Props = stateProps & dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<stateProps, dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(Component))