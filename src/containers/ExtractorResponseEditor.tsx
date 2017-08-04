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
    entityName: string,
    entityId: string,
    textClass: {},
    dropdownClass: {},
    labelClass: {},
}

interface IndexGroup {
    start: number,
    end: number,
    entity: EntityBase
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
        let indexGroups: IndexGroup[] = [];
        let count: number = 0;
        let currentIndexGroup: IndexGroup = {
            start: 0,
            end: null,
            entity: null
        }
        predictedEntities.map((p: PredictedEntity) => {
            if (count == 0) {
                if (p.startCharIndex == 0) {
                    //handle the case where the first character of the input is part of an entity
                    currentIndexGroup = { ...currentIndexGroup, end: p.endCharIndex + 1, entity: this.props.entities.find((e: EntityBase) => e.entityId == p.entityId) }
                    indexGroups.push(currentIndexGroup);
                    currentIndexGroup = {
                        start: p.endCharIndex + 1,
                        end: null,
                        entity: null
                    }
                } else {
                    //handle the case where the first character of the input is part of a piece of regular text
                    currentIndexGroup = { ...currentIndexGroup, end: p.startCharIndex }
                    indexGroups.push(currentIndexGroup);
                    currentIndexGroup = { ...currentIndexGroup, start: p.startCharIndex, end: p.endCharIndex + 1, entity: this.props.entities.find((e: EntityBase) => e.entityId == p.entityId) }
                    indexGroups.push(currentIndexGroup);
                    currentIndexGroup = {
                        start: p.endCharIndex + 1,
                        end: null,
                        entity: null
                    }
                }
            } else {
                if (currentIndexGroup.start == p.startCharIndex) {
                    //handle the case where the first character after the last entity is part of another entity
                    currentIndexGroup = { ...currentIndexGroup, end: p.endCharIndex, entity: this.props.entities.find((e: EntityBase) => e.entityId == p.entityId) }
                    indexGroups.push(currentIndexGroup);
                    currentIndexGroup = {
                        start: p.endCharIndex + 1,
                        end: null,
                        entity: null
                    }
                } else {
                    //handle the case where the first character after the last entity is part of a piece of regular text
                    currentIndexGroup = { ...currentIndexGroup, end: p.startCharIndex }
                    indexGroups.push(currentIndexGroup);
                    currentIndexGroup = { ...currentIndexGroup, start: p.startCharIndex, end: p.endCharIndex + 1, entity: this.props.entities.find((e: EntityBase) => e.entityId == p.entityId) }
                    indexGroups.push(currentIndexGroup);
                    currentIndexGroup = {
                        start: p.endCharIndex + 1,
                        end: null,
                        entity: null
                    }
                }
            }
            count++;
            if (predictedEntities.length == count) {
                //handle the case where there is text after the last predicted entity
                if (p.endCharIndex !== input.length - 1) {
                    currentIndexGroup = { ...currentIndexGroup, end: input.length}
                    indexGroups.push(currentIndexGroup);
                }
            }
        })
        let substringObjects: SubstringObject[] = [];
        indexGroups.map((i: IndexGroup) => {
            let substringObj: SubstringObject = {
                text: input.substring(i.start, i.end),
                entityName: i.entity === null ? null : i.entity.entityName,
                entityId: i.entity === null ? null : i.entity.entityId,
                textClass: i.entity === null ? styles.normal : styles.highlighted,
                //dropdown class is going to have to depend on some state object. When you click an substring group with an entity it needs to go from styles.hidden to styles.normal
                dropdownClass: styles.hidden,
                labelClass: i.entity === null ? styles.hidden : styles.normal
            }
            substringObjects.push(substringObj)
        })
        console.log('SUBSTRING OBJS', substringObjects)
        return substringObjects;
    }
    render() {
        let substringObjects: SubstringObject[] = this.createSubstringObjects(this.props.input, this.props.predictedEntities)
        return (
            <div>
                {substringObjects.map((s: SubstringObject) => {
                    <div style={styles.containerDiv}>
                        <Label style={s.labelClass}>{s.entityName}</Label>
                        <p style={s.textClass}>{s.text}</p>
                        <Dropdown style={s.dropdownClass} />
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