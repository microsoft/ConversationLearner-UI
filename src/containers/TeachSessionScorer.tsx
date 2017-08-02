import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { TrainScorerStep, ScoredBase } from 'blis-models';
import { postScorerFeedback } from '../actions/teachActions'
import { CommandButton } from 'office-ui-fabric-react';
import { IColumn, DetailsList, CheckboxVisibility } from 'office-ui-fabric-react';
import { dummyTrainScorerStep } from '../epics/apiHelpers' // TEMP

let columns: IColumn[] = [
    {
        key: 'select',
        name: '',
        fieldName: 'actionId',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'payload',
        name: 'Payload',
        fieldName: 'payload',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'score',
        name: 'Score',
        fieldName: 'score',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        isSorted: true,
        isSortedDescending: true
    }
]

class TeachSessionScorer extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            columns: columns,
            sortColumn : columns[2] // "score"
        }
    }
    onColumnClick(event: any, column : any) {
        let { sortedItems, columns } = this.state;
        let isSortedDescending = column.isSortedDescending;

        // If we've sorted this column, flip it.
        if (column.isSorted) {
            isSortedDescending = !isSortedDescending;
        }

        // Reset the items and columns to match the state.
        this.setState({
            columns: columns.map((col: any) => {
                col.isSorted = (col.key === column.key);

                if (col.isSorted) {
                    col.isSortedDescending = isSortedDescending;
                }

                return col;
            }),
            sortColumn : column
        });
    }
    getValue(memory: any, col: IColumn) : any
    {
        let value = memory[col.fieldName]
        if (col.fieldName == "score" && !memory[col.fieldName]) {
                if (memory["reason"] == 'notAvailable') {
                    return -100;
                }
                else {  // notScorable
                    return -1;
                }
        }
        if (!value) value = "";

        if (typeof value == 'string' || value instanceof String) {
            return value.toUpperCase();
        }
        return value;
    }
    handleActionSelection(actionId : string)
    {
        let labelAction = actionId;
        // TEMP
        let trainScorerStep = dummyTrainScorerStep();
        let appId: string = this.props.apps.current.appId;
        let teachId: string = this.props.teachSession.current.teachId;
        this.props.postScorerFeedback(this.props.user.key, appId, teachId, trainScorerStep);
    }
    renderItemColumn(item?: any, index?: number, column?: IColumn) {
        let fieldContent = item[column.fieldName];
        switch (column.key) {
            case 'select':
                if (item["reason"] == "notAvailable") {
                    return (
                        <div>
                            <a><span className="actionUnavailable ms-Icon ms-Icon--ChromeClose"></span></a>
                        </div>
                        )
                    }

                return (
                    <div>
                        <a onClick={() => this.handleActionSelection(fieldContent)}><span className="actionSelect ms-Icon ms-Icon--CompletedSolid"></span></a>
                    </div>
                )
            case 'score':
                if (fieldContent) {
                    fieldContent = (fieldContent*100).toFixed(1) + "%"
                } else {
                    fieldContent = item["reason"]
                }
                break;
            default:
                break;
        }
        return <span className='ms-font-m-plus'>{fieldContent}</span>
    }
    renderScores(): ScoredBase[] {
        let filteredScores = this.props.teachSession.scoreResponse.scoredActions.concat(this.props.teachSession.scoreResponse.unscoredActions) || [];

        if (this.state.sortColumn)
        {
            // Sort the items.
            filteredScores = filteredScores.concat([]).sort((a: any, b: any) => {
                let firstValue = this.getValue(a, this.state.sortColumn);
                let secondValue = this.getValue(b, this.state.sortColumn);

                if (this.state.sortColumn.isSortedDescending) {
                    return firstValue > secondValue ? -1 : 1;
                } 
                else {
                    return firstValue > secondValue ? 1 : -1;
                }
            });
        }

        return filteredScores;
    }
    render() {
        let scores = this.renderScores();
        return (
            <div className='content'>
                <div className="teachSessionHalfMode">
                    TeachSessionScorer
                    <DetailsList
                        className="ms-font-m-plus"
                        items={scores}
                        columns={this.state.columns}
                        checkboxVisibility={CheckboxVisibility.hidden}
                        onRenderItemColumn={this.renderItemColumn.bind(this)}
                        onColumnHeaderClick={ this.onColumnClick.bind(this) }
                    />
                </div>
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        postScorerFeedback: postScorerFeedback,
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        user: state.user,
        teachSession: state.teachSessions,
        apps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TeachSessionScorer as React.ComponentClass<any>);