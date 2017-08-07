import { editActionAsync } from '../actions/updateActions';
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
    leftBracketStyle: {},
    rightBracketStyle: {},
    dropdownStyle: {},
    labelStyle: {},
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
        display: "block"
    },
    labelDisplayed: {
        display: "block"
    },
    rightBracketDisplayedBlack: {
        display: "inline-block",
        marginLeft: "2px",
        color: "black"
    },
    leftBracketDisplayedBlack: {
        display: "inline-block",
        marginRight: "2px",
        color: "black"
    },
    rightBracketDisplayedGray: {
        display: "inline-block",
        marginLeft: "2px",
        color: "gray"
    },
    leftBracketDisplayedGray: {
        display: "inline-block",
        marginRight: "2px",
        color: "gray"
    },
    containerDiv: {
        display: "inline-block",
        verticalAlign: "bottom",
        marginLeft: "5px",
        textAlign: "center"
    },
    textBlockDiv: {
        display: "inline-block",
        verticalAlign: "bottom"
    }
}

class ExtractorResponseEditor extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.renderSubstringObject = this.renderSubstringObject.bind(this)
        this.createSubstringObjects = this.createSubstringObjects.bind(this)
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
                    currentIndexGroup = { ...currentIndexGroup, end: input.length }
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
                rightBracketStyle: i.entity === null ? styles.hidden : styles.rightBracketDisplayedBlack,
                leftBracketStyle: i.entity === null ? styles.hidden : styles.leftBracketDisplayedBlack,
                //dropdown Style is going to have to depend on some state object. When you click an substring group with an entity it needs to go from styles.hidden to styles.normal
                dropdownStyle: styles.hidden,
                labelStyle: i.entity === null ? styles.hidden : styles.labelDisplayed
            }
            substringObjects.push(substringObj)
        })
        return substringObjects;
    }
    handleClick(s: SubstringObject) {
        console.log(s)
    }
    renderSubstringObject(s: SubstringObject, key: number) {
        let options = this.props.entities.map((e: EntityBase) => {
            return {
                key: e.entityName,
                text: e.entityName
            }
        })
        return (
            <div key={key} style={styles.containerDiv}>
                <span style={s.labelStyle} className='ms-font-s'>{s.entityName}</span>
                <div style={styles.textBlockDiv}>
                    <span style={s.leftBracketStyle} className='ms-font-xxl'>[</span>
                    <span className='ms-font-xl' onClick={() => this.handleClick(s)}>{s.text}</span>
                    <span style={s.rightBracketStyle} className='ms-font-xxl'>]</span>
                </div>

                <Dropdown style={s.dropdownStyle} options={options} />
            </div>
        )
    }
    render() {
        let substringObjects: SubstringObject[] = this.createSubstringObjects(this.props.input, this.props.predictedEntities)
        let key: number = 0;
        return (
            <div>
                {substringObjects.map((s: SubstringObject) => {
                    return this.renderSubstringObject(s, ++key)
                })}
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        editActionAsync: editActionAsync,
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        entities: state.entities
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ExtractorResponseEditor as React.ComponentClass<any>);