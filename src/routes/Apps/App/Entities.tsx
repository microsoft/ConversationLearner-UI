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
import { deleteEntityThunkAsync } from '../../../actions/deleteActions'
import { fetchApplicationTrainingStatusThunkAsync } from '../../../actions/fetchActions'
import { State } from '../../../types';
import { onRenderDetailsHeader } from '../../../components/ToolTips'
import { AppBase, EntityBase, EntityType } from 'conversationlearner-models'
import { FM } from '../../../react-intl-messages'
import { injectIntl, InjectedIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { autobind } from 'office-ui-fabric-react/lib/Utilities';

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
            maxWidth: 200,
            isResizable: true,
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
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            getSortValue: entity => {
                let display = (entity.entityType === EntityType.LOCAL || entity.entityType === EntityType.LUIS)
                    ? 'CUSTOM' : entity.entityType;
                return display.toLowerCase();
            },
            render: entity => (
                <span className={OF.FontClassNames.mediumPlus}>
                    {(entity.entityType === EntityType.LOCAL || entity.entityType === EntityType.LUIS)
                        ? 'CUSTOM' : entity.entityType}
                </span>)
        },
        {
            key: 'isProgrammatic',
            name: intl.formatMessage({
                id: FM.ENTITIES_COLUMNS_IS_PROGRAMMATIC,
                defaultMessage: 'Programmatic'
            }),
            fieldName: 'programmatic',
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            getSortValue: entity => (entity.entityType === EntityType.LOCAL) ? 'a' : 'b',
            render: entity => <OF.Icon iconName={entity.entityType === EntityType.LOCAL ? "CheckMark" : "Remove"} className="cl-icon" />
        },
        {
            key: 'isBucketable',
            name: intl.formatMessage({
                id: FM.ENTITIES_COLUMNS_IS_BUCKETABLE,
                defaultMessage: 'Multi-Value'
            }),
            fieldName: 'metadata',
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            getSortValue: entity => entity.isMultivalue ? 'a' : 'b',
            render: entity => <OF.Icon iconName={entity.isMultivalue ? "CheckMark" : "Remove"} className="cl-icon" />
        },
        {
            key: 'isNegatable',
            name: intl.formatMessage({
                id: FM.ENTITIES_COLUMNS_IS_NEGATABLE,
                defaultMessage: 'Negatable'
            }),
            fieldName: 'metadata',
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            getSortValue: entity => entity.isNegatible ? 'a' : 'b',
            render: entity => <OF.Icon iconName={entity.isNegatible ? "CheckMark" : "Remove"} className="cl-icon" />
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

    state: ComponentState = {
        searchValue: '',
        createEditModalOpen: false,
        entitySelected: null,
        columns: getColumns(this.props.intl),
        sortColumn: null
    }

    componentDidMount() {
        this.newEntityButton.focus()
    }

    @autobind
    handleDelete(entityId: string) {
        let entityToDelete = this.props.entities.find(entity => entity.entityId === entityId)
        this.props.deleteEntityThunkAsync(this.props.app.appId, entityId, entityToDelete.negativeId)
        this.setState({
            createEditModalOpen: false
        })
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

    @autobind
    onClickColumnHeader(event: any, clickedColumn: IRenderableColumn) {
        let { columns } = this.state;
        let isSortedDescending = clickedColumn.isSortedDescending;

        // If we've sorted this column, flip it.
        if (clickedColumn.isSorted) {
            isSortedDescending = !isSortedDescending;
        }

        // Reset the items and columns to match the state.
        this.setState({
            columns: columns.map(col => {
                col.isSorted = (col.key === clickedColumn.key);

                if (col.isSorted) {
                    col.isSortedDescending = isSortedDescending;
                }

                return col;
            }),
            sortColumn: clickedColumn
        });
    }

    @autobind
    getFilteredAndSortedEntities(): EntityBase[] {
        //runs when user changes the text or sort
        let lcString = this.state.searchValue.toLowerCase();
        let filteredEntities = this.props.entities.filter(e => {
            let nameMatch = e.entityName.toLowerCase().includes(lcString);
            let typeMatch = e.entityType.toLowerCase().includes(lcString);
            let match = nameMatch || typeMatch
            return match && !e.positiveId;
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

    @autobind
    onChange(newValue: string) {
        // runs when user changes the text 
        let lcString = newValue.toLowerCase();
        this.setState({
            searchValue: lcString
        })
    }
    render() {
        let entityItems = this.getFilteredAndSortedEntities()

        return (
            <div className="cl-page">
                <span className={OF.FontClassNames.xxLarge}>
                    <FormattedMessage
                        id={FM.ENTITIES_TITLE}
                        defaultMessage="Entities"
                    />
                </span>
                {this.props.editingPackageId === this.props.app.devPackageId ?
                    <span className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.ENTITIES_SUBTITLE}
                            defaultMessage="Manage a list of entities in your application and track and control their instances within actions..."
                        />
                    </span> 
                    :
                    <span className="cl-errorpanel">Editing is only allowed in Master Tag</span>
                }
                <div>
                    <OF.PrimaryButton
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
                        componentRef={component => this.newEntityButton = component}
                    />
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
                <OF.SearchBox
                    className={OF.FontClassNames.mediumPlus}
                    onChange={(newValue) => this.onChange(newValue)}
                    onSearch={(newValue) => this.onChange(newValue)}
                />
                <OF.DetailsList
                    className={OF.FontClassNames.mediumPlus}
                    items={entityItems}
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
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        deleteEntityThunkAsync,
        fetchApplicationTrainingStatusThunkAsync
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
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
