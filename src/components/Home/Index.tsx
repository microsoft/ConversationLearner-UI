import * as React from 'react'
import {
    withRouter
} from 'react-router-dom'
import './Index.css'
import { DetailsList, CheckboxVisibility, PrimaryButton, IColumn } from 'office-ui-fabric-react';
import { BlisAppBase } from 'blis-models'
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createBLISApplicationAsync } from '../../actions/createActions';
import { State } from '../../types';
import { RouteComponentProps } from 'react-router'

interface IRenderableColumn extends IColumn {
    render: (a: BlisAppBase) => JSX.Element
}

let columns: IRenderableColumn[] = [
    {
        key: 'appName',
        name: 'App Name',
        fieldName: 'appName',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        render: app => <span className='ms-font-m-plus'>{app.appName}</span>
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
        render: app => <span className='ms-font-m-plus'>{app.metadata.botFrameworkApps.length}</span>
    },
];

class component extends React.Component<Props, any> {
    onClickCreateApp() {
        var randomNumber = Math.floor(Math.random() * 10000)
        console.log('create app', randomNumber)
        const app: BlisAppBase = {
            appId: `random-id-${randomNumber}`,
            appName: `New App ${randomNumber}`,
            luisKey: "key",
            locale: "en-us",
            metadata: {
                botFrameworkApps: []
            }
        };

        this.props.createBLISApplicationAsync("", "", app)
    }

    render() {
        const { match, history } = this.props;
        return (
            <div className="blis-page">
                <h1 className="ms-font-su">My Apps</h1>
                <p className="ms-font-m-plus">Create and Manage your BLIS applications...</p>
                <div>
                    <PrimaryButton
                        className="blis-button blis-button--primary"
                        onClick={() => this.onClickCreateApp()}
                    >Create New App</PrimaryButton>
                </div>
                <DetailsList
                    className="ms-font-m-plus"
                    items={[]}
                    columns={columns}
                    checkboxVisibility={CheckboxVisibility.hidden}
                    onRenderItemColumn={(app, index, column: IRenderableColumn) => column.render(app)}
                    onActiveItemChanged={(app: BlisAppBase) => history.push(`${match.url}/${app.appId}`, { app })}
                />
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createBLISApplicationAsync
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        apps: state.apps
    }
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & RouteComponentProps<any>;

export default connect<typeof stateProps, typeof dispatchProps, RouteComponentProps<any>>(mapStateToProps, mapDispatchToProps)(withRouter(component));