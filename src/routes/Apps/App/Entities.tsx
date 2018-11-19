/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as OF from 'office-ui-fabric-react';
import { EntityCreatorEditor } from '../../../components/modals'
import actions from '../../../actions'
import { State } from '../../../types';
import { onRenderDetailsHeader } from '../../../components/ToolTips/ToolTips'
import { AppBase, EntityBase, EntityType } from '@conversationlearner/models'
import { FM } from '../../../react-intl-messages'
import { injectIntl, InjectedIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import * as moment from 'moment'

interface IRenderableColumn extends OF.IColumn {
    render: (entity: EntityBase, component: Entities) => JSX.Element | JSX.Element[]
    getSortValue: (entity: EntityBase, component: Entities) => string
}

function getColumns(intl: InjectedIntl): IRenderableColumn[] {
    return [
        {
            key: 'entityName',
            name: intl.formatMessage({
                id: FM.ENTITIES_COLUMNS_NAME,
                defaultMessage: 'Entity Name'
            }),
            fieldName: 'entityName',
            minWidth: 100,
            isResizable: true,
            isSortedDescending: true,
            getSortValue: entity => entity.entityName.toLowerCase(),
            render: entity => <span className={OF.FontClassNames.mediumPlus}>{entity.entityName}</span>
        },
        {
            key: 'entityType',
            name: intl.formatMessage({
                id: FM.ENTITIES_COLUMNS_TYPE,
                defaultMessage: 'Type'
            }),
            fieldName: 'entityType',
            minWidth: 180,
            maxWidth: 180,
            isResizable: true,
            getSortValue: entity => {
                let display = (entity.entityType === EntityType.LOCAL || entity.entityType === EntityType.LUIS)
                    ? 'CUSTOM' : entity.entityType;
                return display.toLowerCase();
            },
            render: entity => {
                let display = entity.entityType
                if (display === EntityType.LOCAL) {
                    display = "PROGRAMMATIC"
                }
                else if (display === EntityType.LUIS) {
                    display = "CUSTOM"
                }
                return (
                    <span className={OF.FontClassNames.mediumPlus}>
                        {display}
                    </span>)
            }
        },
        {
            key: 'resolverType',
            name: intl.formatMessage({
                id: FM.ENTITIES_COLUMNS_RESOLVER,
                defaultMessage: 'Resolver Type'
            }),
            fieldName: 'resolverType',
            minWidth: 180,
            maxWidth: 180,
            isResizable: true,
            getSortValue: entity => {
                let display = entity.resolverType === undefined || entity.resolverType === null ? "none" : entity.resolverType;
                return display.toLowerCase();
            },
            render: entity => {
                let display = entity.resolverType === undefined || entity.resolverType === null ? "none" : entity.resolverType
                if (display.toLowerCase() === "none") {
                    return (
                        <OF.Icon iconName="Remove" className="cl-icon" />
                    )
                }
                return (
                    <span className={OF.FontClassNames.mediumPlus}>
                        {display}
                    </span>)
            }
        },
        {
            key: 'isBucketable',
            name: intl.formatMessage({
                id: FM.ENTITIES_COLUMNS_IS_BUCKETABLE,
                defaultMessage: 'Multi-Value'
            }),
            fieldName: 'isMultivalue',
            minWidth: 70,
            maxWidth: 70,
            isResizable: false,
            getSortValue: entity => entity.isMultivalue ? 'a' : 'b',
            render: entity => <OF.Icon iconName={entity.isMultivalue ? "CheckMark" : "Remove"} className="cl-icon" />
        },
        {
            key: 'isNegatable',
            name: intl.formatMessage({
                id: FM.ENTITIES_COLUMNS_IS_NEGATABLE,
                defaultMessage: 'Negatable'
            }),
            fieldName: 'isNegatible',
            minWidth: 70,
            maxWidth: 70,
            isResizable: false,
            getSortValue: entity => entity.isNegatible ? 'a' : 'b',
            render: entity => <OF.Icon iconName={entity.isNegatible ? "CheckMark" : "Remove"} className="cl-icon" />
        },
        {
            key: 'created',
            name: intl.formatMessage({
                id: FM.ENTITIES_COLUMNS_CREATED_DATE_TIME,
                defaultMessage: 'Created'
            }),
            fieldName: 'created',
            minWidth: 100,
            isResizable: false,
            getSortValue: entity => moment(entity.createdDateTime).valueOf().toString(),
            render: entity => <span className={OF.FontClassNames.mediumPlus}>{moment(entity.createdDateTime).format('L')}</span>
        }
    ]
}

interface ComponentState {
    searchValue: string
    createEditModalOpen: boolean
    entitySelected: EntityBase | null
    columns: IRenderableColumn[]
    sortColumn: IRenderableColumn
}

class Entities extends React.Component<Props, ComponentState> {
    newEntityButton: OF.IButton
    state: ComponentState

    constructor(props: Props) {
        super(props)
        let columns = getColumns(this.props.intl);
        this.state = {
            searchValue: '',
            createEditModalOpen: false,
            entitySelected: null,
            columns: columns,
            sortColumn: columns[0]
        }
    }

    componentDidMount() {
        this.newEntityButton.focus()
    }

    @OF.autobind
    handleDelete(entity: EntityBase) {
        this.props.deleteEntityThunkAsync(this.props.app.appId, entity)
        this.setState({
            createEditModalOpen: false
        })
    }

    @OF.autobind
    handleOpenCreateModal() {
        this.setState({
            createEditModalOpen: true,
            entitySelected: null
        })
    }

    @OF.autobind
    handleCloseCreateModal() {
        this.setState({
            createEditModalOpen: false,
            entitySelected: null
        })
        setTimeout(() => {
            this.newEntityButton.focus();
        }, 500);
    }

    onSelectEntity(entity: EntityBase) {
        if (this.props.editingPackageId === this.props.app.devPackageId) {
            this.setState({
                entitySelected: entity,
                createEditModalOpen: true
            })
        }
    }

    @OF.autobind
    onClickColumnHeader(event: any, clickedColumn: IRenderableColumn) {
        let { columns } = this.state;
        let isSortedDescending = !clickedColumn.isSortedDescending;

        // Reset the items and columns to match the state.
        this.setState({
            columns: columns.map(col => {
                col.isSorted = (col.key === clickedColumn.key);
                col.isSortedDescending = isSortedDescending;
                return col;
            }),
            sortColumn: clickedColumn
        });
    }

    @OF.autobind
    getFilteredAndSortedEntities(): EntityBase[] {
        //runs when user changes the text or sort
        let lcString = this.state.searchValue.toLowerCase();
        let filteredEntities = this.props.entities.filter(e => {
            let nameMatch = e.entityName.toLowerCase().includes(lcString);
            let typeMatch = e.entityType.toLowerCase().includes(lcString);
            let match = nameMatch || typeMatch
            return match && !e.positiveId && !e.doNotMemorize;
        })

        if (!this.state.sortColumn) {
            return filteredEntities;
        }

        // Sort the items.
        filteredEntities
            .sort((a, b) => {
                const firstValue = this.state.sortColumn.getSortValue(a, this)
                const secondValue = this.state.sortColumn.getSortValue(b, this)
                const compareValue = firstValue.localeCompare(secondValue)
                return this.state.sortColumn.isSortedDescending
                    ? compareValue
                    : compareValue * -1
            })

        return filteredEntities;
    }

    @OF.autobind
    onChange(newValue: string) {
        // runs when user changes the text 
        let lcString = newValue.toLowerCase();
        this.setState({
            searchValue: lcString
        })
    }
    render() {
        const { entities } = this.props
        const computedEntities = this.getFilteredAndSortedEntities()

        return (
            <div className="cl-page">
                <span data-testid="entities-title" className={OF.FontClassNames.xxLarge}>
                    <FormattedMessage
                        id={FM.ENTITIES_TITLE}
                        defaultMessage="Entities"
                    />
                </span>
                {this.props.editingPackageId === this.props.app.devPackageId ?
                    <span className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.ENTITIES_SUBTITLE}
                            defaultMessage="Entities hold values from the user or are set by code, and are stored in the bot's memory to track state"
                        />
                    </span>
                    :
                    <span className="cl-errorpanel">Editing is only allowed in Master Tag</span>
                }
                <div>
                    <OF.PrimaryButton
                        data-testid="entities-button-create"
                        disabled={this.props.editingPackageId !== this.props.app.devPackageId}
                        onClick={this.handleOpenCreateModal}
                        ariaDescription={this.props.intl.formatMessage({
                            id: FM.ENTITIES_CREATEBUTTONARIALDESCRIPTION,
                            defaultMessage: 'Create a New Entity'
                        })}
                        text={this.props.intl.formatMessage({
                            id: FM.ENTITIES_CREATEBUTTONTEXT,
                            defaultMessage: 'New Entity'
                        })}
                        componentRef={component => this.newEntityButton = component!}
                    />
                </div>
                {entities.length === 0
                    ? <div className="cl-page-placeholder">
                        <div className="cl-page-placeholder__content">
                            <div className={`cl-page-placeholder__description ${OF.FontClassNames.xxLarge}`}>Create an Entity</div>
                            <OF.PrimaryButton
                                iconProps={{
                                    iconName: "Add"
                                }}
                                disabled={this.props.editingPackageId !== this.props.app.devPackageId}
                                onClick={this.handleOpenCreateModal}
                                ariaDescription={this.props.intl.formatMessage({
                                    id: FM.ENTITIES_CREATEBUTTONARIALDESCRIPTION,
                                    defaultMessage: 'Create a New Entity'
                                })}
                                text={this.props.intl.formatMessage({
                                    id: FM.ENTITIES_CREATEBUTTONTEXT,
                                    defaultMessage: 'New Entity'
                                })}
                            />
                        </div>
                    </div>
                    : <React.Fragment>
                        <div>
                            <OF.Label htmlFor="entities-input-search" className={OF.FontClassNames.medium}>
                                Search:
                            </OF.Label>
                            <OF.SearchBox
                                id="entities-input-search"
                                className={OF.FontClassNames.mediumPlus}
                                onChange={(newValue) => this.onChange(newValue)}
                                onSearch={(newValue) => this.onChange(newValue)}
                            />
                        </div>
                        <OF.DetailsList
                            className={OF.FontClassNames.mediumPlus}
                            items={computedEntities}
                            columns={this.state.columns}
                            checkboxVisibility={OF.CheckboxVisibility.hidden}
                            onRenderItemColumn={(entity: EntityBase, i, column: IRenderableColumn) =>
                                column.render(entity, this)}
                            onRenderDetailsHeader={(detailsHeaderProps: OF.IDetailsHeaderProps,
                                defaultRender: OF.IRenderFunction<OF.IDetailsHeaderProps>) =>
                                onRenderDetailsHeader(detailsHeaderProps, defaultRender)}
                            onColumnHeaderClick={this.onClickColumnHeader}
                            onActiveItemChanged={entity => this.onSelectEntity(entity)}
                        />
                    </React.Fragment>}
                <EntityCreatorEditor
                    app={this.props.app}
                    editingPackageId={this.props.editingPackageId}
                    open={this.state.createEditModalOpen}
                    entity={this.state.entitySelected}
                    handleClose={this.handleCloseCreateModal}
                    handleDelete={this.handleDelete}
                    entityTypeFilter={null}
                />
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        deleteEntityThunkAsync: actions.entity.deleteEntityThunkAsync,
        fetchApplicationTrainingStatusThunkAsync: actions.app.fetchApplicationTrainingStatusThunkAsync
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    return {
        entities: state.entities,
        actions: state.actions
    }
}

export interface ReceivedProps {
    app: AppBase
    editingPackageId: string
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(Entities))
