import * as React from 'react'
import {
    withRouter
} from 'react-router-dom'
import './Index.css'
import { DetailsList, CheckboxVisibility, PrimaryButton, IColumn } from 'office-ui-fabric-react';

interface IApp {
    id: string
    name: string
    description: string,
    luisKey: string,
    locale: string,
    linkedBots: string[],
    actions: string[]
}

const apps: IApp[] = [
    {
        id: 'app-id-1',
        name: 'App 1',
        description: 'App 1 description',
        luisKey: 'abc123uvw456',
        locale: 'en-US',
        linkedBots: [],
        actions: []
    },
    {
        id: 'app-id-2',
        name: 'App 2',
        description: 'App 2 description',
        luisKey: 'XYZ21-0349sad20345',
        locale: 'en-GB',
        linkedBots: [],
        actions: []
    },
]

interface IRenderableColumn extends IColumn {
    render: (a: IApp) => React.ReactNode
}

let columns: IRenderableColumn[] = [
    {
        key: 'appName',
        name: 'App Name',
        fieldName: 'appName',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        render: app => <span className='ms-font-m-plus'>{app.name}</span>
    },
    {
        key: 'luisKey',
        name: 'LUIS Key',
        fieldName: 'luisKey',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        render: app => <span className='ms-font-m-plus'>{app.luisKey}</span>
    },
    {
        key: 'locale',
        name: 'Locale',
        fieldName: 'locale',
        minWidth: 50,
        maxWidth: 200,
        render: app => <span className='ms-font-m-plus'>{app.locale}</span>
    },
    {
        key: 'bots',
        name: 'Linked Bots',
        fieldName: 'metadata',
        minWidth: 40,
        render: app => <span className='ms-font-m-plus'>{app.linkedBots.length}</span>
    },
    {
        key: 'actions',
        name: 'Actions',
        fieldName: 'appId',
        minWidth: 40,
        render: app => <span className='ms-font-m-plus'>{app.actions.length}</span>
    },
];

const component = ({ match, history }: any) => (
    <div className="blis-page">
        <h1 className="ms-font-su">My Apps</h1>
        <p className="ms-font-m-plus">Create and Manage your BLIS applications...</p>
        <div>
            <PrimaryButton
                className="blis-button blis-button--primary"
            >Create New App</PrimaryButton>
        </div>
        <DetailsList
            className="ms-font-m-plus"
            items={apps}
            columns={columns}
            checkboxVisibility={CheckboxVisibility.hidden}
            onRenderItemColumn={(app, index, column: IRenderableColumn) => column.render(app)}
            onActiveItemChanged={app => history.push(`${match.url}/${app.id}`, { app })}
        />
    </div>
)

export default withRouter(component)