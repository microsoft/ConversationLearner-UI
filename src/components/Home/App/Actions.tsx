import * as React from 'react'
import { PrimaryButton, CheckboxVisibility, SearchBox, DetailsList, IColumn } from 'office-ui-fabric-react'
import ActionCreateModal from './../../modals/ActionCreateModal'

interface IAction {
    wait: boolean
    actionType: string
    requiredEntities: string[]
    negativeEntities: string[]
    suggestedEntities: string[]
}

interface IRenderableColumn extends IColumn {
    render: (a: IAction) => React.ReactNode
}

const actions: IAction[] = [
    {
        wait: true,
        actionType: "best type",
        requiredEntities: [],
        negativeEntities: [],
        suggestedEntities: []
    },
    {
        wait: true,
        actionType: "best type",
        requiredEntities: [],
        negativeEntities: [],
        suggestedEntities: []
    }
]

let columns: IRenderableColumn[] = [
    {
        key: 'payload',
        name: 'Payload',
        fieldName: 'payload',
        minWidth: 100,
        maxWidth: 200,
        render: action => true ? <span className="ms-Icon ms-Icon--CheckMark"></span> : <span className="ms-Icon ms-Icon--Remove"></span>
    },
    {
        key: 'actionType',
        name: 'Action Type',
        fieldName: 'metadata',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        render: action => true ? <span className="ms-Icon ms-Icon--CheckMark"></span> : <span className="ms-Icon ms-Icon--Remove"></span>
    },
    {
        key: 'requiredEntities',
        name: 'Required Entities',
        fieldName: 'requiredEntities',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        render: action => true ? <span className="ms-Icon ms-Icon--CheckMark"></span> : <span className="ms-Icon ms-Icon--Remove"></span>
    },
    {
        key: 'negativeEntities',
        name: 'Negative Entities',
        fieldName: 'negativeEntities',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        render: action => true ? <span className="ms-Icon ms-Icon--CheckMark"></span> : <span className="ms-Icon ms-Icon--Remove"></span>
    },
    {
        key: 'suggestedEntity',
        name: 'Suggested Entity',
        fieldName: 'metadata',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        render: action => true ? <span className="ms-Icon ms-Icon--CheckMark"></span> : <span className="ms-Icon ms-Icon--Remove"></span>
    },
    {
        key: 'wait',
        name: 'Wait',
        fieldName: 'isTerminal',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        render: action => true ? <span className="ms-Icon ms-Icon--CheckMark"></span> : <span className="ms-Icon ms-Icon--Remove"></span>
    }
];

class component extends React.Component<any, any> {
    state = {
        open: false
    }

    onClickCreateAction() {
        this.setState({
            open: true
        })
    }

    onCreateActionModalCancel() {
        this.setState({
            open: false
        })
    }
    onCreateActionModalClose() {
        this.setState({
            open: false
        })
    }
    onActionInvoked(action: IAction) {
        console.log(`action invoked: `, action)
    }

    render() {
        return (
            <div className="blis-page">
                <h1 className="ms-font-xxl">Actions</h1>
                <p className="ms-font-m-plus">Manage a list of actions that your application can take given it's state and user input...</p>
                <div>
                    <PrimaryButton
                        onClick={() => this.onClickCreateAction()}
                        className='blis-button blis-button--primary'
                        ariaDescription='Create a New Action'
                        text='New Action'
                    />
                    <ActionCreateModal
                        open={this.state.open}
                        cancel={() => this.onCreateActionModalCancel()}
                        close={() => this.onCreateActionModalClose()}
                    />
                </div>
                <SearchBox
                    className="ms-font-m-plus"
                />
                <DetailsList
                    className="ms-font-m-plus"
                    items={actions}
                    columns={columns}
                    checkboxVisibility={CheckboxVisibility.hidden}
                    onRenderItemColumn={(app, index, column: IRenderableColumn) => column.render(app)}
                    onItemInvoked={action => this.onActionInvoked(action)}
                />
            </div>
        )
    }
}

export default component