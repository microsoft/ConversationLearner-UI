import { toggleTrainDialog } from '../actions/updateActions';
import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ExtractResponse, TrainExtractorStep, PredictedEntity, LabeledEntity, EntityBase } from 'blis-models'
import { State } from '../types';
import { TextField, Dropdown, Label } from 'office-ui-fabric-react'

interface PassedProps {
    input: string;
    predictedEntities: PredictedEntity[],
    updatePredictedEntities: Function
}

interface SubstringObject {
    text: string,
    entity: EntityBase
    textClass: {},
    dropdownClass: {},
    labelClass: {},
}

const styles = {
    hidden: {
        display: "none"
    },
    normal: {

    },
    highlighted: {
        backgroundColor: "yellow"
    },
    containerDiv: {
        display: "inline-block",
        verticalAlign: "top"
    }
}

class ExtractorResponseEditor extends React.Component<any, any> {
    constructor(p: any) {
        super(p)
    }
    createSubstringObjects(input: string, predictedEntities: PredictedEntity[]): SubstringObject[] {
        let substringObjects: SubstringObject[] = [];
        return substringObjects;
    }
    render() {
        let substringObjects: SubstringObject[] = this.createSubstringObjects(this.props.input, this.props.predictedEntities)
        return (
            <div>
                {substringObjects.map((s: SubstringObject) => {
                    <div style={styles.containerDiv}>
                        <Label style={s.labelClass}/>
                        <TextField style={s.textClass}/>
                        <Dropdown style={s.dropdownClass}/>
                    </div>
                })}
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        toggleTrainDialog: toggleTrainDialog,
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        entities: state.entities
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ExtractorResponseEditor as React.ComponentClass<any>);