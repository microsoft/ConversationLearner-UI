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
import { getLuisApplicationCultures } from '../../epics/apiHelpers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State, ErrorType, AppCreatorType } from '../../types'
import { FM } from '../../react-intl-messages'
import { AT } from '../../types/ActionTypes'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { autobind } from 'core-decorators';
import { OBIImportData } from '../../Utils/obiUtils'

interface ComponentState {
    appNameVal: string
    localeVal: string
    localeOptions: OF.IDropdownOption[]
    clFile: File | null
    obiFiles: File[] | null
    autoCreate: boolean
    autoMerge: boolean
    autoActionMatch: boolean
}

class AppCreator extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        appNameVal: '',
        localeVal: '',
        localeOptions: [],
        clFile: null,
        obiFiles: null,
        autoCreate: true,
        autoMerge: true,
        autoActionMatch: true
    }

    private fileInput: any

    async componentDidMount() {
        const cultures = await getLuisApplicationCultures()
        const cultureOptions = cultures.map<OF.IDropdownOption>(c =>
            ({
                key: c.cultureCode,
                text: c.cultureCode,
            }))

        this.setState({
            localeOptions: cultureOptions,
            localeVal: cultureOptions[0].text
        })
    }

    componentDidUpdate(prevProps: Props) {
        // Reset when opening modal
        if (this.props.open === false && prevProps.open === true) {
            const firstValue = this.state.localeOptions[0].text
            this.setState({
                appNameVal: '',
                localeVal: firstValue,
                clFile: null,
                obiFiles: null
            })
        }
    }

    @autobind
    onChangeName(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string) {
        this.setState({
            appNameVal: text.trim().length ? text : ""
        })
    }

    @autobind
    onChangeLocale(event: React.FormEvent<HTMLDivElement>, localeOption: OF.IDropdownOption) {
        this.setState({
            localeVal: localeOption.text
        })
    }

    onChangeOBIFiles = (files: any) => {
        this.setState({
            obiFiles: files
        })
    }

    @autobind
    onChangeAutoImport() {
        this.setState({
            autoCreate: !this.state.autoCreate
        })
    }

    @autobind
    onChangeAutoMerge() {
        this.setState({
            autoMerge: !this.state.autoMerge
        })
    }

    @autobind
    onChangeAutoActionMatch() {
        this.setState({
            autoActionMatch: !this.state.autoActionMatch
        })
    }

    @autobind
    onClickCancel() {
        this.props.onCancel()
    }

    getAppInput(): Partial<CLM.AppBase> {
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

    @autobind
    onClickCreateOBI() {
        if (this.props.onSubmitOBI && this.state.obiFiles && !this.onGetNameErrorMessage(this.state.appNameVal).length) {
            const appInput = this.getAppInput()
            const obiImportData: OBIImportData = {
                appId: "",
                files: this.state.obiFiles,
                autoCreate: this.state.autoCreate,
                autoMerge: this.state.autoMerge,
                autoActionCreate: this.state.autoActionMatch
            }
            this.props.onSubmitOBI(appInput, obiImportData)
        }
    }

    // TODO: Refactor to use default form submission instead of manually listening for keys
    // Also has benefit of native browser validation for required fields
    @autobind
    onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
        // On enter attempt to create the model if required fields are set
        if (event.key === 'Enter' && this.state.appNameVal) {
            switch (this.props.creatorType) {
                case AppCreatorType.IMPORT:
                    if (this.state.clFile) {
                        this.onClickImport()
                    }
                    break
                case AppCreatorType.OBI:
                    if (this.state.obiFiles) {
                        this.onClickCreateOBI()
                    }
                    break
                default:
                        this.onClickCreate()
            }
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

    onGetPasswordErrorMessage(value: string): string {
        return value ? "" : Util.formatMessageId(this.props.intl, FM.FIELDERROR_REQUIREDVALUE)
    }

    onChangeImportFile = (files: any) => {
        this.setState({
            clFile: files[0]
        })
    }

    onClickImport = () => {
        if (!this.state.clFile) {
            console.warn(`You clicked import before a file was selected. This should not be possible. Contact support`)
            return
        }

        const reader = new FileReader()
        reader.onload = (e: Event) => {
            try {
                if (typeof reader.result !== 'string') {
                    throw new Error("String Expected")
                }
                const source = JSON.parse(reader.result) as CLM.AppDefinition
                const appInput = this.getAppInput();
                this.props.onSubmit(appInput, source)
            }
            catch (e) {
                const error = e as Error
                this.props.setErrorDisplay(ErrorType.Error, error.message, "Invalid file contents", AT.CREATE_APPLICATION_ASYNC)
            }
        }
        reader.readAsText(this.state.clFile)
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
            case AppCreatorType.OBI:
                return (
                    <FormattedMessageId id={FM.APPCREATOR_OBI_TITLE} />)
            default:
                throw new Error(`Could not get title for unknown app creator type: ${this.props.creatorType}`)
        }
    }

    getLabel(intl: ReactIntl.InjectedIntl): string {
        return (this.props.creatorType !== AppCreatorType.NEW) ?
            Util.formatMessageId(intl, FM.APPCREATOR_FIELDS_IMPORT_NAME_LABEL)
            :
            Util.formatMessageId(intl, FM.APPCREATOR_FIELDS_NAME_LABEL)
    }

    isSubmitDisabled(): boolean {
        const invalidName = this.onGetNameErrorMessage(this.state.appNameVal) !== ""
        if (invalidName) {
            return true
        }

        switch (this.props.creatorType) {
            case AppCreatorType.OBI:
                return this.state.obiFiles === null
            case AppCreatorType.IMPORT:
                return this.state.clFile === null
            default:
                return false
        }
    }
    render() {
        const { intl } = this.props
        return (
            <OF.Modal
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
                        onChange={this.onChangeName}
                        label={this.getLabel(intl)}
                        placeholder={Util.formatMessageId(intl, FM.APPCREATOR_FIELDS_NAME_PLACEHOLDER)}
                        onKeyDown={key => this.onKeyDown(key)}
                        value={this.state.appNameVal}
                    />
                    {this.props.creatorType === AppCreatorType.NEW &&
                        <OF.Dropdown
                            ariaLabel={Util.formatMessageId(intl, FM.APPCREATOR_FIELDS_LOCALE_LABEL)}
                            label={Util.formatMessageId(intl, FM.APPCREATOR_FIELDS_LOCALE_LABEL)}
                            defaultSelectedKey={this.state.localeVal}
                            options={this.state.localeOptions}
                            onChange={this.onChangeLocale}
                            disabled={true}
                        // Disabled until trainer can support more than english
                        />
                    }
                    {this.props.creatorType === AppCreatorType.IMPORT &&
                        <div data-testid="model-creator-import-file-picker">
                            <OF.Label>Import File</OF.Label>
                            <input
                                type="file"
                                style={{ display: 'none' }}
                                onChange={(event) => this.onChangeImportFile(event.target.files)}
                                ref={ele => (this.fileInput = ele)}
                                multiple={false}
                            />
                            <div className="cl-file-picker">
                                <OF.PrimaryButton
                                    data-testid="model-creator-locate-file-button"
                                    className="cl-file-picker-button"
                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.APPCREATOR_CHOOSE_FILE_BUTTON_ARIADESCRIPTION)}
                                    text={Util.formatMessageId(this.props.intl, FM.APPCREATOR_CHOOSE_FILE_BUTTON_TEXT)}
                                    iconProps={{ iconName: 'DocumentSearch' }}
                                    onClick={() => this.fileInput.click()}
                                />
                                <OF.TextField
                                    disabled={true}
                                    value={this.state.clFile
                                        ? this.state.clFile.name
                                        : ''}
                                />
                            </div>
                        </div>
                    }
                    {this.props.creatorType === AppCreatorType.OBI &&
                        <>
                            <input
                                type="file"
                                style={{ display: 'none' }}
                                onChange={(event) => this.onChangeOBIFiles(event.target.files)}
                                ref={ele => (this.fileInput = ele)}
                                multiple={true}
                            />
                            <div className="cl-file-picker">
                                <OF.PrimaryButton
                                    data-testid="transcript-locate-file-button"
                                    className="cl-file-picker-button"
                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_SELECT_FILES)}
                                    text={Util.formatMessageId(this.props.intl, FM.BUTTON_SELECT_FILES)}
                                    iconProps={{ iconName: 'DocumentSearch' }}
                                    onClick={() => this.fileInput.click()}
                                />
                                <OF.TextField
                                    disabled={true}
                                    value={!this.state.obiFiles
                                        ? undefined
                                        : this.state.obiFiles.length === 1
                                        ? this.state.obiFiles[0].name
                                        : `${this.state.obiFiles.length} files selected`
                                    }
                                />
                            </div>
                            <OF.Checkbox
                                label={Util.formatMessageId(this.props.intl, FM.IMPORT_AUTOIMPORT)}
                                checked={this.state.autoCreate}
                                onChange={this.onChangeAutoImport}
                            />
                            <OF.Checkbox
                                label={Util.formatMessageId(this.props.intl, FM.IMPORT_AUTOMERGE)}
                                checked={this.state.autoMerge}
                                onChange={this.onChangeAutoMerge}
                            />
                            <OF.Checkbox
                                label={Util.formatMessageId(this.props.intl, FM.IMPORT_AUTOACTIONMATCH)}
                                checked={this.state.autoActionMatch}
                                onChange={this.onChangeAutoActionMatch}
                            />
                        </>
                    }
                </div>
                <div className='cl-modal_footer'>
                    <div className="cl-modal-buttons">
                        <div className="cl-modal-buttons_secondary" />
                        <div className="cl-modal-buttons_primary">
                            {this.props.creatorType === AppCreatorType.IMPORT &&
                                <OF.PrimaryButton
                                    disabled={this.isSubmitDisabled()}
                                    data-testid="model-creator-submit-button"
                                    onClick={this.onClickImport}
                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.APPCREATOR_IMPORT_BUTTON_ARIADESCRIPTION)}
                                    text={Util.formatMessageId(this.props.intl, FM.APPCREATOR_IMPORT_BUTTON_TEXT)}
                                    iconProps={{ iconName: 'Accept' }}
                                />
                            }
                            {this.props.creatorType === AppCreatorType.OBI &&
                                <OF.PrimaryButton
                                    disabled={this.isSubmitDisabled()}
                                    data-testid="model-creator-submit-button"
                                    onClick={this.onClickCreateOBI}
                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.APPCREATOR_IMPORT_BUTTON_ARIADESCRIPTION)}
                                    text={Util.formatMessageId(this.props.intl, FM.APPCREATOR_IMPORT_BUTTON_TEXT)}
                                    iconProps={{ iconName: 'Accept' }}
                                />
                            }
                            {this.props.creatorType === AppCreatorType.NEW &&
                                <OF.PrimaryButton
                                    disabled={this.isSubmitDisabled()}
                                    data-testid="model-creator-submit-button"
                                    onClick={this.onClickCreate}
                                    ariaDescription={Util.formatMessageId(intl, FM.BUTTON_CREATE)}
                                    text={Util.formatMessageId(intl, FM.BUTTON_CREATE)}
                                    iconProps={{ iconName: 'Accept' }}
                                />
                            }
                            {this.props.creatorType === AppCreatorType.COPY &&
                                <OF.PrimaryButton
                                    disabled={this.isSubmitDisabled()}
                                    data-testid="model-creator-submit-button"
                                    onClick={this.onClickCreate}
                                    ariaDescription={Util.formatMessageId(intl, FM.APPCREATOR_COPYBUTTON_ARIADESCRIPTION)}
                                    text={Util.formatMessageId(intl, FM.APPCREATOR_COPYBUTTON_ARIADESCRIPTION)}
                                    iconProps={{ iconName: 'Accept' }}
                                />
                            }
                            <OF.DefaultButton
                                data-testid="model-creator-cancel-button"
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
    creatorType: AppCreatorType
    onSubmit: (app: Partial<CLM.AppBase>, source?: CLM.AppDefinition) => void
    onSubmitOBI?: (app: Partial<CLM.AppBase>, obiImportData: OBIImportData) => void
    onCancel: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
type stateProps = ReturnType<typeof mapStateToProps>
type dispatchProps = ReturnType<typeof mapDispatchToProps>
type Props = stateProps & dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<stateProps, dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(AppCreator))