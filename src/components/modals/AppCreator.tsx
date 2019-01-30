/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { getLuisApplicationCultures } from '../../epics/apiHelpers'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import * as OF from 'office-ui-fabric-react'
import { State, ErrorType, AppCreatorType } from '../../types'
import { FM } from '../../react-intl-messages'
import { AT } from '../../types/ActionTypes'
import { FilePicker } from 'react-file-picker'
import { setErrorDisplay } from '../../actions/displayActions'
import FormattedMessageId from '../FormattedMessageId'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { AppInput } from '../../types/models';
import { AppDefinition } from '@conversationlearner/models';
import * as Utils from '../../Utils/util';

interface ComponentState {
    appNameVal: string
    localeVal: string
    localeOptions: OF.IDropdownOption[]
    file: File | null
}

class AppCreator extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        appNameVal: '',
        localeVal: '',
        localeOptions: [],
        file: null,
    }

    constructor(p: Props) {
        super(p)

        this.onKeyDown = this.onKeyDown.bind(this)
        this.localeChanged = this.localeChanged.bind(this)
        this.onClickCreate = this.onClickCreate.bind(this)
        this.onClickCancel = this.onClickCancel.bind(this)
    }

    componentDidMount() {
        getLuisApplicationCultures()
            .then(cultures => {
                const cultureOptions = cultures.map<OF.IDropdownOption>(c =>
                    ({
                        key: c.cultureCode,
                        text: c.cultureCode,
                    }))

                this.setState({
                    localeOptions: cultureOptions,
                    localeVal: cultureOptions[0].text
                })
            })
    }

    componentWillReceiveProps(nextProps: Props) {
        // Reset when opening modal
        if (this.props.open === false && nextProps.open === true) {
            let firstValue = this.state.localeOptions[0].text
            this.setState({
                appNameVal: '',
                localeVal: firstValue,
                file: null
            })
        }
    }

    nameChanged(text: string) {
        this.setState({
            appNameVal: text.trim().length ? text : ""
        })
    }
    localeChanged(obj: OF.IDropdownOption) {
        this.setState({
            localeVal: obj.text
        })
    }

    onClickCancel() {
        this.props.onCancel()
    }

    getAppInput(): AppInput {
        return {
            appName: this.state.appNameVal.trim(),
            locale: this.state.localeVal,
            metadata: {
                botFrameworkApps: [],
                markdown: undefined,
                video: undefined,
                isLoggingOn: true
            }
        }
    }

    onClickCreate = () => {
        if (!this.onGetNameErrorMessage(this.state.appNameVal).length) {
            const appInput = this.getAppInput()
            this.props.onSubmit(appInput)
        }
    }

    // TODO: Refactor to use default form submission instead of manually listening for keys
    // Also has benefit of native browser validation for required fields
    onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
        // On enter attempt to create the model if required fields are set
        // Not on import as explicit button press is required to pick the file
        if (this.props.creatorType !== AppCreatorType.IMPORT && event.key === 'Enter' && this.state.appNameVal) {
            this.onClickCreate();
        }

        if (this.props.creatorType === AppCreatorType.IMPORT && event.key === 'Enter' && this.state.appNameVal && this.state.file) {
            this.onClickCreate();
        }
    }

    onGetNameErrorMessage(value: string): string {
        const { intl } = this.props
        const MAX_NAME_LENGTH = 30

        if (value.length === 0) {
            return Utils.formatMessageId(intl, FM.APPCREATOR_FIELDERROR_REQUIREDVALUE)
        }

        if (value.length > MAX_NAME_LENGTH) {
            return Utils.formatMessageId(intl, FM.APPCREATOR_FIELDERROR_TOOLONG)
        }

        if (!/^[a-zA-Z0-9- ]+$/.test(value)) {
            return Utils.formatMessageId(intl, FM.APPCREATOR_FIELDERROR_ALPHANUMERIC)
        }

        if (!value.trim().length) {
            return Utils.formatMessageId(intl, FM.APPCREATOR_FIELDERROR_ALPHANUMERIC)
        }

        // Check that name isn't in use
        if (this.props.apps.find(a => a.appName === value)) {
            return Utils.formatMessageId(intl, FM.APPCREATOR_FIELDERROR_DISTINCT)
        }

        return ""
    }

    onGetPasswordErrorMessage(value: string): string {
        return value ? "" : Utils.formatMessageId(this.props.intl, FM.APPCREATOR_FIELDERROR_REQUIREDVALUE)
    }

    onChangeFile = (file: File) => {
        this.setState({
            file
        })
    }

    onClickImport = () => {
        if (!this.state.file) {
            console.warn(`You clicked import before a file was selected. This should not be possible. Contact support`)
            return
        }

        const reader = new FileReader()
        reader.onload = (e: Event) => {
            try {
                if (typeof reader.result !== 'string') {
                    throw new Error("String Expected")
                }
                const source = JSON.parse(reader.result) as AppDefinition
                const appInput = this.getAppInput();
                this.props.onSubmit(appInput, source)
            }
            catch (e) {
                const error = e as Error
                this.props.setErrorDisplay(ErrorType.Error, error.message, "Invalid file contents", AT.CREATE_APPLICATION_ASYNC)
            }
        }
        reader.readAsText(this.state.file)
    }

    getTitle(): React.ReactNode {
        switch (this.props.creatorType) {
            case AppCreatorType.NEW:
                return (
                    <FormattedMessageId id={FM.APPCREATOR_TITLE} />)
            case AppCreatorType.IMPORT:
                return (
                    <FormattedMessageId id={FM.APPCREATOR_IMPORT_TITLE} />)
            case AppCreatorType.COPY:
                return (
                    <FormattedMessageId id={FM.APPCREATOR_COPY_TITLE} />)
            default:
                throw new Error(`Could not get title for unknown app creator type: ${this.props.creatorType}`)
        }
    }

    getLabel(intl: ReactIntl.InjectedIntl): string {
        return (this.props.creatorType !== AppCreatorType.NEW) ?
            Utils.formatMessageId(intl, FM.APPCREATOR_FIELDS_IMPORT_NAME_LABEL)
            :
            Utils.formatMessageId(intl, FM.APPCREATOR_FIELDS_NAME_LABEL)
    }

    render() {
        const { intl } = this.props
        const invalidName = this.onGetNameErrorMessage(this.state.appNameVal) !== ""
        const invalidImport = invalidName || this.state.file === null
        return (
            <Modal
                isOpen={this.props.open}
                onDismiss={() => this.onClickCancel()}
                isBlocking={false}
                containerClassName='cl-modal cl-modal--small'
            >
                <div className='cl-modal_header'>
                    <span className={OF.FontClassNames.xxLarge}>
                        {this.getTitle()}
                    </span>
                </div>
                <div className="cl-action-creator-fieldset">
                    <OF.TextField
                        data-testid="model-creator-input-name"
                        onGetErrorMessage={value => this.onGetNameErrorMessage(value)}
                        onChanged={text => this.nameChanged(text)}
                        label={this.getLabel(intl)}
                        placeholder={Utils.formatMessageId(intl, FM.APPCREATOR_FIELDS_NAME_PLACEHOLDER)}
                        onKeyDown={key => this.onKeyDown(key)}
                        value={this.state.appNameVal}
                    />
                    {this.props.creatorType === AppCreatorType.NEW &&
                        <OF.Dropdown
                            ariaLabel={Utils.formatMessageId(intl, FM.APPCREATOR_FIELDS_LOCALE_LABEL)}
                            label={Utils.formatMessageId(intl, FM.APPCREATOR_FIELDS_LOCALE_LABEL)}
                            defaultSelectedKey={this.state.localeVal}
                            options={this.state.localeOptions}
                            onChanged={this.localeChanged}
                            disabled={true}
                        // Disabled until trainer can support more than english
                        />
                    }
                    {this.props.creatorType === AppCreatorType.IMPORT &&
                        <div data-testid="model-creator-import-file-picker">
                            <OF.Label>Import File</OF.Label>
                            <FilePicker
                                extensions={['cl']}
                                onChange={this.onChangeFile}
                                onError={(error: string) => this.props.setErrorDisplay(ErrorType.Error, error, "", null)}
                                maxSize={10}
                            >
                                <div className="cl-action-creator-file-picker">
                                    <OF.PrimaryButton
                                        data-testid="model-creator-locate-file-button"
                                        className="cl-action-creator-file-button"
                                        ariaDescription={Utils.formatMessageId(this.props.intl, FM.APPCREATOR_CHOOSE_FILE_BUTTON_ARIADESCRIPTION)}
                                        text={Utils.formatMessageId(this.props.intl, FM.APPCREATOR_CHOOSE_FILE_BUTTON_TEXT)}
                                    />
                                    <OF.TextField
                                        disabled={true}
                                        value={this.state.file
                                            ? this.state.file.name
                                            : ''}
                                    />
                                </div>
                            </FilePicker>
                        </div>
                    }
                </div>
                <div className='cl-modal_footer'>
                    <div className="cl-modal-buttons">
                        <div className="cl-modal-buttons_secondary" />
                        <div className="cl-modal-buttons_primary">
                            {this.props.creatorType === AppCreatorType.IMPORT &&
                                <OF.PrimaryButton
                                    disabled={invalidImport}
                                    data-testid="model-creator-submit-button"
                                    onClick={this.onClickImport}
                                    ariaDescription={Utils.formatMessageId(this.props.intl, FM.APPCREATOR_IMPORT_BUTTON_ARIADESCRIPTION)}
                                    text={Utils.formatMessageId(this.props.intl, FM.APPCREATOR_IMPORT_BUTTON_TEXT)}
                                />
                            }
                            {this.props.creatorType === AppCreatorType.NEW &&
                                <OF.PrimaryButton
                                    disabled={invalidName}
                                    data-testid="model-creator-submit-button"
                                    onClick={this.onClickCreate}
                                    ariaDescription={Utils.formatMessageId(intl, FM.APPCREATOR_CREATEBUTTON_ARIADESCRIPTION)}
                                    text={Utils.formatMessageId(intl, FM.APPCREATOR_CREATEBUTTON_TEXT)}
                                />
                            }
                            {this.props.creatorType === AppCreatorType.COPY &&
                                <OF.PrimaryButton
                                    disabled={invalidName}
                                    data-testid="model-creator-submit-button"
                                    onClick={this.onClickCreate}
                                    ariaDescription={Utils.formatMessageId(intl, FM.APPCREATOR_COPYBUTTON_ARIADESCRIPTION)}
                                    text={Utils.formatMessageId(intl, FM.APPCREATOR_COPYBUTTON_ARIADESCRIPTION)}
                                />
                            }
                            <OF.DefaultButton
                                data-testid="model-creator-cancel-button"
                                onClick={this.onClickCancel}
                                ariaDescription={Utils.formatMessageId(intl, FM.APPCREATOR_CANCELBUTTON_ARIADESCRIPTION)}
                                text={Utils.formatMessageId(intl, FM.APPCREATOR_CANCELBUTTON_TEXT)}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setErrorDisplay
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        apps: state.apps.all
    }
}

export interface ReceivedProps {
    open: boolean
    creatorType: AppCreatorType
    onSubmit: (app: AppInput, source?: AppDefinition) => void
    onCancel: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(AppCreator))