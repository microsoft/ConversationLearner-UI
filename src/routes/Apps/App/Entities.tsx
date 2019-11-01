/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as OF from 'office-ui-fabric-react'
import { EntityCreatorEditor } from '../../../components/modals'
import actions from '../../../actions'
import { State } from '../../../types'
import { onRenderDetailsHeader } from '../../../components/ToolTips/ToolTips'
import { AppBase, EntityBase, EntityType } from '@conversationlearner/models'
import { FM } from '../../../react-intl-messages'
import FormattedMessageId from '../../../components/FormattedMessageId'
import { injectIntl, InjectedIntl, InjectedIntlProps } from 'react-intl'
import * as Util from '../../../Utils/util'
import * as moment from 'moment'
import { autobind } from 'core-decorators';

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
            render: entity => <span data-testid="entities-name" className={OF.FontClassNames.mediumPlus}>{entity.entityName}</span>
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
                return entity.entityType.toLowerCase();
            },
            render: entity => {
                let display = entity.entityType
                if (display === EntityType.LOCAL) {
                    display = "PROGRAMMATIC"
                }
                else if (display === EntityType.LUIS) {
                    display = "CUSTOM"
                }
                else if (display === EntityType.ENUM) {
                    display = "ENUM"
                }
                return (
                    <span data-testid="entities-type" className={OF.FontClassNames.mediumPlus}>
                        {display}
                    </span>)
            }
        },
        {
            key: 'entityResolver',
            name: intl.formatMessage({
                id: FM.ENTITIES_COLUMNS_RESOLVER,
                defaultMessage: 'Resolver Type'
            }),
            fieldName: 'entityResolver',
            minWidth: 180,
            maxWidth: 180,
            isResizable: true,
            getSortValue: entity => {
                const display = entity.resolverType === undefined || entity.resolverType === null ? "none" : entity.resolverType;
                return display.toLowerCase();
            },
            render: entity => {
                const display = entity.resolverType === undefined || entity.resolverType === null ? "none" : entity.resolverType
                if (display.toLowerCase() === "none") {
                    return (
                        <OF.Icon iconName="Remove" data-testid="entities-resolver-none" className="cl-icon" />
                    )
                }
                return (
                    <span data-testid="entities-resolver" className={OF.FontClassNames.mediumPlus}>
                        {display}
                    </span>)
            }
        },
        {
            key: 'isMultivalue',
            name: intl.formatMessage({
                id: FM.ENTITIES_COLUMNS_IS_MULTIVALUE,
                defaultMessage: 'Multi-Value'
            }),
            fieldName: 'isMultivalue',
            minWidth: 70,
            maxWidth: 70,
            isResizable: false,
            getSortValue: entity => entity.isMultivalue ? 'a' : 'b',
            render: entity => <OF.Icon iconName={entity.isMultivalue ? "CheckMark" : "Remove"} data-testid="entities-multi-value" className="cl-icon" />
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
            render: entity => <OF.Icon iconName={entity.isNegatible ? "CheckMark" : "Remove"} data-testid="entities-negatable" className="cl-icon" />
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
            render: entity => <span className={OF.FontClassNames.mediumPlus}>{Util.earlierDateOrTimeToday(entity.createdDateTime)}</span>
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
    newEntityButtonRef = React.createRef<OF.IButton>()
    state: ComponentState

    constructor(props: Props) {
        super(props)
        const columns = getColumns(this.props.intl)
        const defaultSortColumnName = "entityName"
        const defaultSortColumn = columns.find(c => c.key === defaultSortColumnName)
        if (!defaultSortColumn) {
            throw new Error(`Could not find column by name: ${defaultSortColumnName}`)
        }

        columns.forEach(col => {
            col.isSorted = false
            col.isSortedDescending = false

            if (col === defaultSortColumn) {
                col.isSorted = true
            }
        })

        this.state = {
            searchValue: '',
            createEditModalOpen: false,
            entitySelected: null,
            columns: columns,
            sortColumn: defaultSortColumn,
        }
    }

    componentDidMount() {
        this.focusNewEntityButton()
    }

    @autobind
    handleDelete(entity: EntityBase) {
        this.setState({
            createEditModalOpen: false,
            entitySelected: null
        })
        this.props.deleteEntityThunkAsync(this.props.app.appId, entity)
        setTimeout(() => this.focusNewEntityButton(), 1000)
    }

    @autobind
    handleOpenCreateModal() {
        this.setState({
            createEditModalOpen: true,
            entitySelected: null
        })
    }

    @autobind
    handleCloseCreateModal() {
        this.setState({
            createEditModalOpen: false,
            entitySelected: null
        })
        setTimeout(() => {
            this.focusNewEntityButton();
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

    @autobind
    onClickColumnHeader(event: any, clickedColumn: IRenderableColumn) {
        const sortColumn = this.state.columns.find(c => c.key === clickedColumn.key)!
        const columns = this.state.columns.map(column => {
            column.isSorted = false
            column.isSortedDescending = false
            if (column === sortColumn) {
                column.isSorted = true
                column.isSortedDescending = !clickedColumn.isSortedDescending
            }
            return column
        })

        // Reset the items and columns to match the state.
        this.setState({
            columns,
            sortColumn
        })
    }

    @autobind
    getFilteredAndSortedEntities(): EntityBase[] {
        //runs when user changes the text or sort
        const lcString = this.state.searchValue.toLowerCase();
        const filteredEntities = this.props.entities.filter(e => {
            const nameMatch = e.entityName.toLowerCase().includes(lcString);
            const typeMatch = e.entityType.toLowerCase().includes(lcString);
            const match = nameMatch || typeMatch
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
                    ? compareValue * -1
                    : compareValue
            })

        return filteredEntities;
    }

    @autobind
    onChangeSearchString(event?: React.ChangeEvent<HTMLInputElement>, newValue?: string) {
        if (!newValue) {
            return
        }

        this.onSearch(newValue)
    }

    @autobind
    onSearch(newValue: string) {
        // runs when user changes the text
        const lcString = newValue.toLowerCase();
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
                    <FormattedMessageId id={FM.ENTITIES_TITLE} />
                </span>
                {this.props.editingPackageId === this.props.app.devPackageId ?
                    <span className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessageId id={FM.ENTITIES_SUBTITLE} />
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
                        iconProps={{ iconName: 'Add' }}
                        componentRef={this.newEntityButtonRef}
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
                                onChange={this.onChangeSearchString}
                                onSearch={this.onSearch}
                            />
                        </div>
                        <OF.DetailsList
                            className={OF.FontClassNames.mediumPlus}
                            items={computedEntities}
                            columns={this.state.columns}
                            checkboxVisibility={OF.CheckboxVisibility.hidden}
                            onRenderRow={(props, defaultRender) => <div data-selection-invoke={true}>{defaultRender && defaultRender(props)}</div>}
                            onRenderItemColumn={(entity: EntityBase, i, column: IRenderableColumn) =>
                                column.render(entity, this)}
                            onRenderDetailsHeader={(detailsHeaderProps: OF.IDetailsHeaderProps,
                                defaultRender: OF.IRenderFunction<OF.IDetailsHeaderProps>) =>
                                onRenderDetailsHeader(detailsHeaderProps, defaultRender)}
                            onColumnHeaderClick={this.onClickColumnHeader}
                            onItemInvoked={entity => this.onSelectEntity(entity)}
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

    private focusNewEntityButton() {
        if (this.newEntityButtonRef.current) {
            this.newEntityButtonRef.current.focus()
        }
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        deleteEntityThunkAsync: actions.entity.deleteEntityThunkAsync,
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
type stateProps = ReturnType<typeof mapStateToProps>;
type dispatchProps = ReturnType<typeof mapDispatchToProps>;
type Props = stateProps & dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<stateProps, dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(Entities))
