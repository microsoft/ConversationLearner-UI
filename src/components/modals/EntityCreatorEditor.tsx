import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { createEntityAsync } from '../../actions/createActions';
import { editEntityAsync } from '../../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import * as OF from 'office-ui-fabric-react';
import ActionDetailsList from '../ActionDetailsList'
import { State, PreBuiltEntities } from '../../types';
import { BlisDropdownOption } from './BlisDropDownOption'
import { GetTip, TipType } from '../ToolTips'
import { BlisAppBase, EntityBase, EntityMetaData, EntityType, ActionBase } from 'blis-models'
import './EntityCreatorEditor.css'
import { FM } from '../../react-intl-messages'
import { defineMessages, injectIntl, InjectedIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'

const messages = defineMessages({
    fieldErrorRequired: {
        id: FM.ENTITYCREATOREDITOR_FIELDERROR_REQUIREDVALUE,
        defaultMessage: "Required Value"
    },
    fieldErrorAlphanumeric: {
        id: FM.ENTITYCREATOREDITOR_FIELDERROR_ALPHANUMERIC,
        defaultMessage: 'Entity name may only contain alphanumeric characters with no spaces.'
    },
    fieldErrorDistinct: {
        id: FM.ENTITYCREATOREDITOR_FIELDERROR_DISTINCT,
        defaultMessage: 'Name is already in use.'
    }
})



const NEW_ENTITY = 'New Entity';

const initState: ComponentState = {
    entityNameVal: '',
    entityTypeVal: NEW_ENTITY,
    isBucketableVal: false,
    isNegatableVal: false,
    isProgrammaticVal: false,
    editing: false,
    title: ''
};

interface ComponentState {
    entityNameVal: string;
    entityTypeVal: string;
    isBucketableVal: boolean;
    isNegatableVal: boolean;
    isProgrammaticVal: boolean;
    editing: boolean;
    title: string;
}

function getStaticEntityOptions(intl: InjectedIntl): BlisDropdownOption[] {
    return [
        {
            key: NEW_ENTITY,
            text: intl.formatMessage({
                id: FM.ENTITYCREATOREDITOR_ENTITYOPTION_NEW,
                defaultMessage: 'New Type'
            }),
            itemType: OF.DropdownMenuItemType.Normal,
            style: 'blisDropdown--command'
        },
        {
            key: 'divider',
            text: '-',
            itemType: OF.DropdownMenuItemType.Divider,
            style: 'blisDropdown--normal'
        }
    ]
}

class EntityCreatorEditor extends React.Component<Props, ComponentState> {
    staticEntityOptions: BlisDropdownOption[]
    entityOptions: BlisDropdownOption[]
    state = initState

    constructor(props: Props) {
        super(props)
        this.staticEntityOptions = getStaticEntityOptions(this.props.intl)
    }

    componentWillReceiveProps(p: Props) {
        // Build entity options based on current applicaiton locale
        const currentAppLocale = this.props.app.locale
        const localePreBuiltEntities = PreBuiltEntities
            .find(obj => obj.locale === currentAppLocale)

        // Filter out one that have already been used
        const unusedPreBuilts = localePreBuiltEntities.preBuiltEntities
            .filter(bp => {
                return !this.props.entities.find(e => e.entityType === bp);
            })

        const localePreBuildOptions = unusedPreBuilts
            .map<BlisDropdownOption>(entityName =>
                ({
                    key: entityName,
                    text: entityName,
                    itemType: OF.DropdownMenuItemType.Normal,
                    style: 'blisDropdown--normal'
                }))

        this.entityOptions = [...this.staticEntityOptions, ...localePreBuildOptions]

        if (p.entity === null) {
            this.setState({
                ...initState,
                title: p.intl.formatMessage({
                    id: FM.ENTITYCREATOREDITOR_TITLE_CREATE,
                    defaultMessage: 'Create an Entity'
                }),
                entityTypeVal: this.props.entityTypeFilter ? this.props.entityTypeFilter : NEW_ENTITY
            });
        } else {
            let entityType = p.entity.entityType;
            let isProgrammatic = false;
            if (entityType === EntityType.LUIS) {
                entityType = NEW_ENTITY;
            } else if (entityType === EntityType.LOCAL) {
                entityType = NEW_ENTITY;
                isProgrammatic = true;
            }
            this.setState({
                entityNameVal: p.entity.entityName,
                entityTypeVal: entityType,
                isBucketableVal: p.entity.metadata.isBucket,
                isNegatableVal: p.entity.metadata.isReversable,
                isProgrammaticVal: isProgrammatic,
                editing: true,
                title: p.intl.formatMessage({
                    id: FM.ENTITYCREATOREDITOR_TITLE_EDIT,
                    defaultMessage: 'Edit Entity'
                })
            })
        }
    }

    convertStateToEntity(state: ComponentState): EntityBase {
        let entityType = this.state.entityTypeVal;
        if (entityType === NEW_ENTITY) {
            entityType = (this.state.isProgrammaticVal) ? EntityType.LOCAL : EntityType.LUIS;
        }
        return new EntityBase({
            entityName: this.state.entityNameVal,
            metadata: new EntityMetaData({
                isBucket: this.state.isBucketableVal,
                isReversable: this.state.isNegatableVal,
                negativeId: null,
                positiveId: null,
            }),
            entityType: entityType,
            version: null,
            packageCreationId: null,
            packageDeletionId: null
        })
    }

    onClickSubmit = () => {
        const entity = this.convertStateToEntity(this.state)
        let currentAppId = this.props.app.appId

        if (this.state.editing === false) {
            this.props.createEntityAsync(this.props.userKey, entity, currentAppId);
        } else {
            // TODO: Currently it's not possible to edit an entity, 
            // and the code below is incorrect because it doesn't pass the app id.
            // Set entity id if we're editing existing id.
            // entity.entityId = this.props.entity.entityId;
            // this.props.editEntityAsync(this.props.userKey, entity);
        }

        this.props.handleClose()
    }

    onClickCancel = () => {
        this.props.handleClose()
    }

    onChangedName = (text: string) => {
        this.setState({
            entityNameVal: text
        })
    }
    onChangedType = (obj: BlisDropdownOption) => {
        this.setState({
            entityTypeVal: obj.text
        })
    }
    onChangeProgrammatic = () => {
        this.setState({
            isProgrammaticVal: !this.state.isProgrammaticVal,
        })
    }
    onChangeBucketable = () => {
        this.setState({
            isBucketableVal: !this.state.isBucketableVal,
        })
    }
    onChangeReversible = () => {
        this.setState({
            isNegatableVal: !this.state.isNegatableVal,
        })
    }

    onGetNameErrorMessage = (value: string): string => {
        const { intl } = this.props

        if (value.length === 0) {
            return intl.formatMessage(messages.fieldErrorRequired)
        }

        if (!/^[a-zA-Z0-9-]+$/.test(value)) {
            return intl.formatMessage(messages.fieldErrorAlphanumeric)
        }

        // Check that name isn't in use
        if (!this.state.editing) {
            let foundEntity = this.props.entities.find(e => e.entityName === this.state.entityNameVal);
            if (foundEntity) {
                return intl.formatMessage(messages.fieldErrorDistinct)
            }
        }

        return '';
    }

    onKeyDownName = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // On enter attempt to create the entity as long as name is set
        if (event.key === 'Enter' && this.onGetNameErrorMessage(this.state.entityNameVal) === '') {
            this.onClickSubmit();
        }
    }

    getBlockedActions(): ActionBase[] {
        let blockedActions = this.props.actions.filter(a => {
            return a.negativeEntities.find(id => id === this.props.entity.entityId) != null;
        });
        return blockedActions;
    }

    getRequiredActions(): ActionBase[] {
        let requiredActions = this.props.actions.filter(a => {
            return a.requiredEntities.find(id => id === this.props.entity.entityId) != null;
        });
        return requiredActions;
    }

    onRenderOption = (option: BlisDropdownOption): JSX.Element => {
        return (
            <div className="dropdownExample-option">
                <span className={option.style}>{option.text}</span>
            </div>
        );
    }

    renderEdit() {
        const { intl } = this.props
        return (
            <div>
                <OF.TextField
                    onGetErrorMessage={this.onGetNameErrorMessage}
                    onChanged={this.onChangedName}
                    onKeyDown={this.onKeyDownName}
                    label={intl.formatMessage({
                        id: FM.ENTITYCREATOREDITOR_FIELDS_NAME_LABEL,
                        defaultMessage: "Entity Name"
                    })}
                    placeholder={intl.formatMessage({
                        id: FM.ENTITYCREATOREDITOR_FIELDS_NAME_PLACEHOLDER,
                        defaultMessage: "Name..."
                    })}
                    required={true}
                    value={this.state.entityNameVal}
                    disabled={this.state.editing}
                />
                <OF.Dropdown
                    label={intl.formatMessage({
                        id: FM.ENTITYCREATOREDITOR_FIELDS_TYPE_LABEL,
                        defaultMessage: "Entity Type"
                    })}
                    options={this.entityOptions}
                    onChanged={this.onChangedType}
                    onRenderOption={(option) => this.onRenderOption(option as BlisDropdownOption)}
                    selectedKey={this.state.entityTypeVal}
                    disabled={this.state.editing || this.props.entityTypeFilter != null}
                />
                <div className="blis-entity-creator-checkbox">
                    <OF.Checkbox
                        label={intl.formatMessage({
                            id: FM.ENTITYCREATOREDITOR_FIELDS_PROGRAMMATICONLY_LABEL,
                            defaultMessage: "Programmatic Only"
                        })}
                        defaultChecked={this.state.isProgrammaticVal}
                        onChange={this.onChangeProgrammatic}
                        disabled={this.state.editing || this.state.entityTypeVal !== NEW_ENTITY}
                    />
                    <div className="ms-fontSize-s ms-fontColor-neutralSecondary">
                        <FormattedMessage
                            id={FM.ENTITYCREATOREDITOR_FIELDS_PROGRAMMATICONLY_HELPTEXT}
                            defaultMessage="Entity only set by code."
                        />&nbsp;
                        <OF.TooltipHost
                            tooltipProps={{
                                onRenderContent: () => { return GetTip(TipType.ENTITY_PROGAMMATIC) }
                            }}
                            delay={OF.TooltipDelay.medium}
                            directionalHint={OF.DirectionalHint.bottomCenter}
                        >
                            <span className="ms-fontColor-themeTertiary">
                                <FormattedMessage
                                    id={FM.ENTITYCREATOREDITOR_FIELDS_TOOLTIPTARGET}
                                    defaultMessage="More"
                                />
                            </span>
                        </OF.TooltipHost>
                    </div>
                </div>
                <div className="blis-entity-creator-checkbox">
                    <OF.Checkbox
                        label={intl.formatMessage({
                            id: FM.ENTITYCREATOREDITOR_FIELDS_MULTIVALUE_LABEL,
                            defaultMessage: "Multi-valued"
                        })}
                        defaultChecked={this.state.isBucketableVal}
                        onChange={this.onChangeBucketable}
                        disabled={this.state.editing}
                    />
                    <div className="ms-fontSize-s ms-fontColor-neutralSecondary">
                        <FormattedMessage
                            id={FM.ENTITYCREATOREDITOR_FIELDS_MULTIVALUE_HELPTEXT}
                            defaultMessage="Entity may hold multiple values."
                        />&nbsp;
                            <OF.TooltipHost
                            tooltipProps={{
                                onRenderContent: () => { return GetTip(TipType.ENTITY_MULTIVALUE) }
                            }}
                            delay={OF.TooltipDelay.medium}
                            directionalHint={OF.DirectionalHint.bottomCenter}
                        >
                            <span className="ms-fontColor-themeTertiary">
                                <FormattedMessage
                                    id={FM.ENTITYCREATOREDITOR_FIELDS_TOOLTIPTARGET}
                                    defaultMessage="More"
                                />
                            </span>
                        </OF.TooltipHost>
                    </div>
                </div>
                <div className="blis-entity-creator-checkbox">
                    <OF.Checkbox
                        label={intl.formatMessage({
                            id: FM.ENTITYCREATOREDITOR_FIELDS_NEGATAABLE_LABEL,
                            defaultMessage: "Negatable"
                        })}
                        defaultChecked={this.state.isNegatableVal}
                        onChange={this.onChangeReversible}
                        disabled={this.state.editing}
                    />
                    <div className="ms-fontSize-s ms-fontColor-neutralSecondary">
                        <FormattedMessage
                            id={FM.ENTITYCREATOREDITOR_FIELDS_NEGATABLE_HELPTEXT}
                            defaultMessage="Can remove or delete values in memory."
                        /> &nbsp;
                            <OF.TooltipHost
                            tooltipProps={{
                                onRenderContent: () => { return GetTip(TipType.ENTITY_NEGATABLE) }
                            }}
                            delay={OF.TooltipDelay.medium}
                            directionalHint={OF.DirectionalHint.bottomCenter}
                        >
                            <span className="ms-fontColor-themeTertiary">
                                <FormattedMessage
                                    id={FM.ENTITYCREATOREDITOR_FIELDS_TOOLTIPTARGET}
                                    defaultMessage="More"
                                />
                            </span>
                        </OF.TooltipHost>
                    </div>
                </div>
            </div>
        )
    }
    render() {
        const { intl } = this.props
        return (
            <Modal
                isOpen={this.props.open}
                isBlocking={false}
                containerClassName='blis-modal blis-modal--medium blis-modal--border'
            >
                <div className='blis-modal_header'>
                    <span className='ms-font-xxl ms-fontWeight-semilight'>{this.state.editing ? this.props.entity.entityName : this.state.title}</span>
                </div>
                <div className='blis-modal_body'>
                    {this.state.editing
                        ? (
                            <div>
                                <OF.Pivot linkSize={OF.PivotLinkSize.large}>
                                    <OF.PivotItem linkText={intl.formatMessage({
                                        id: FM.ENTITYCREATOREDITOR_PIVOT_EDIT,
                                        defaultMessage: 'Edit Entity'
                                    })}>
                                        {this.renderEdit()}
                                    </OF.PivotItem>
                                    <OF.PivotItem linkText={intl.formatMessage({
                                        id: FM.ENTITYCREATOREDITOR_PIVOT_REQUIREDFOR,
                                        defaultMessage: 'Required For Actions'
                                    })}>
                                        <ActionDetailsList
                                            actions={this.getRequiredActions()}
                                            onSelectAction={null}
                                        />
                                    </OF.PivotItem>
                                    <OF.PivotItem linkText={intl.formatMessage({
                                        id: FM.ENTITYCREATOREDITOR_PIVOT_BLOCKEDACTIONS,
                                        defaultMessage: 'Blocked Actions'
                                    })}>
                                        <ActionDetailsList
                                            actions={this.getBlockedActions()}
                                            onSelectAction={null}
                                        />
                                    </OF.PivotItem>
                                </OF.Pivot>
                            </div>
                        ) : (
                            this.renderEdit()
                        )}
                </div>
                <div className="blis-modal_footer">
                    <div className="blis-modal-buttons">
                        <div className="blis-modal-buttons_primary">
                            {!this.state.editing &&
                                <OF.PrimaryButton
                                    disabled={this.onGetNameErrorMessage(this.state.entityNameVal) != ''}
                                    onClick={this.onClickSubmit}
                                    ariaDescription={intl.formatMessage({
                                        id: FM.ENTITYCREATOREDITOR_CREATEBUTTON_ARIADESCRIPTION,
                                        defaultMessage: "Create"
                                    })}
                                    text={intl.formatMessage({
                                        id: FM.ENTITYCREATOREDITOR_CREATEBUTTON_TEXT,
                                        defaultMessage: "Create"
                                    })}
                                />
                            }
                            {!this.state.editing &&
                                <OF.DefaultButton
                                    onClick={this.onClickCancel}
                                    ariaDescription={intl.formatMessage({
                                        id: FM.ENTITYCREATOREDITOR_CANCELBUTTON_ARIADESCRIPTION,
                                        defaultMessage: "Cancel"
                                    })}
                                    text={intl.formatMessage({
                                        id: FM.ENTITYCREATOREDITOR_CANCELBUTTON_TEXT,
                                        defaultMessage: "Cancel"
                                    })}
                                />
                            }
                            {this.state.editing &&
                                <OF.PrimaryButton
                                    onClick={this.onClickCancel}
                                    ariaDescription={intl.formatMessage({
                                        id: FM.ENTITYCREATOREDITOR_DONEBUTTON_ARIADESCRIPTION,
                                        defaultMessage: "Done"
                                    })}
                                    text={intl.formatMessage({
                                        id: FM.ENTITYCREATOREDITOR_DONEBUTTON_TEXT,
                                        defaultMessage: "Done"
                                    })}
                                />
                            }
                            {this.state.editing && this.props.handleOpenDeleteModal &&
                                <OF.DefaultButton
                                    onClick={() => this.props.handleOpenDeleteModal(this.props.entity.entityId)}
                                    ariaDescription={intl.formatMessage({
                                        id: FM.ENTITYCREATOREDITOR_DELETEBUTTON_ARIADESCRIPTION,
                                        defaultMessage: "Delete"
                                    })}
                                    text={intl.formatMessage({
                                        id: FM.ENTITYCREATOREDITOR_DELETEBUTTON_TEXT,
                                        defaultMessage: "Delete"
                                    })}
                                />}
                        </div>
                        <div className="blis-modal-button_secondary" />
                    </div>
                </div>
            </Modal>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createEntityAsync,
        editEntityAsync
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        userKey: state.user.key,
        entities: state.entities,
        actions: state.actions,
    }
}

export interface ReceivedProps {
    open: boolean,
    entity: EntityBase | null,
    handleClose: Function,
    entityTypeFilter: EntityType | null,
    app: BlisAppBase
    handleOpenDeleteModal: (entityId: string) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(EntityCreatorEditor))