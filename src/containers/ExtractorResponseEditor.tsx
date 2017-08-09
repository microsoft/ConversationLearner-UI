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
    startIndex: number
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
        this.state = {
            input: "",
            predictedEntities: [],
            substringClicked: null,
            substringObjects: null
        }
        this.renderSubstringObject = this.renderSubstringObject.bind(this)
        this.createSubstringObjects = this.createSubstringObjects.bind(this)
        this.handleClick = this.handleClick.bind(this)
        this.handleHover = this.handleHover.bind(this)
        this.setInitialValues = this.setInitialValues.bind(this)
        this.findIndexOfHoveredSubstring = this.findIndexOfHoveredSubstring.bind(this)
    }
    componentDidMount() {
        this.setInitialValues(this.props)
    }
    componentWillMount() {
        this.setInitialValues(this.props)
    }
    componentWillReceiveProps(props: any) {
        this.setInitialValues(props)
    }
    setInitialValues(props: any) {
        if (props.input && props.predictedEntities && (props.input !== this.state.input)) {
            this.setState({
                input: props.input,
                predictedEntities: props.predictedEntities
            })
            this.createSubstringObjects(props.input, props.predictedEntities)
        }
    }
    createSubstringObjects(input: string, predictedEntities: PredictedEntity[]): void {
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
        // run through the index groups but handle the entities and strings differently
        indexGroups.map((i: IndexGroup) => {
            if (i.entity === null) {
                //is string
                let nonEntities: SubstringObject[] = [];
                let wordStartIndex: number;
                for (var x = i.start; x <= i.end; x++) {
                    //push substring objects into non entities
                    if (x == i.start) {
                        //this is the first letter of the string
                        if (input[x] == " ") {
                            let substringObjForSpace: SubstringObject = {
                                text: input.substring(x, x + 1),
                                entityName: null,
                                entityId: null,
                                rightBracketStyle: styles.hidden,
                                leftBracketStyle: styles.hidden,
                                //dropdown Style is going to have to depend on some state object. When you click an substring group with an entity it needs to go from styles.hidden to styles.normal
                                dropdownStyle: styles.hidden,
                                labelStyle: styles.hidden,
                                startIndex: x
                            }
                            nonEntities.push(substringObjForSpace)
                            wordStartIndex = x + 1
                        } else {
                            wordStartIndex = x;
                        }
                    } else if (x == (i.end - 1)) {
                        //this is the last letter of the index group
                        if (x == input.length - 1) {
                            //this is the last letter of the input entirely
                            let substringObj: SubstringObject = {
                                text: input.substring(wordStartIndex, x + 1),
                                entityName: null,
                                entityId: null,
                                rightBracketStyle: styles.hidden,
                                leftBracketStyle: styles.hidden,
                                //dropdown Style is going to have to depend on some state object. When you click an substring group with an entity it needs to go from styles.hidden to styles.normal
                                dropdownStyle: styles.hidden,
                                labelStyle: styles.hidden,
                                startIndex: wordStartIndex
                            }
                            nonEntities.push(substringObj)
                        } else {
                            if (input[x] == " ") {
                                let substringObj: SubstringObject = {
                                    text: input.substring(wordStartIndex, x),
                                    entityName: null,
                                    entityId: null,
                                    rightBracketStyle: styles.hidden,
                                    leftBracketStyle: styles.hidden,
                                    //dropdown Style is going to have to depend on some state object. When you click an substring group with an entity it needs to go from styles.hidden to styles.normal
                                    dropdownStyle: styles.hidden,
                                    labelStyle: styles.hidden,
                                    startIndex: wordStartIndex
                                }
                                let substringObjForSpace: SubstringObject = {
                                    text: input.substring(x, x + 1),
                                    entityName: null,
                                    entityId: null,
                                    rightBracketStyle: styles.hidden,
                                    leftBracketStyle: styles.hidden,
                                    //dropdown Style is going to have to depend on some state object. When you click an substring group with an entity it needs to go from styles.hidden to styles.normal
                                    dropdownStyle: styles.hidden,
                                    labelStyle: styles.hidden,
                                    startIndex: x
                                }
                                nonEntities.push(substringObj)
                                nonEntities.push(substringObjForSpace)
                            } else {
                                let substringObj: SubstringObject = {
                                    text: input.substring(wordStartIndex, x),
                                    entityName: null,
                                    entityId: null,
                                    rightBracketStyle: styles.hidden,
                                    leftBracketStyle: styles.hidden,
                                    //dropdown Style is going to have to depend on some state object. When you click an substring group with an entity it needs to go from styles.hidden to styles.normal
                                    dropdownStyle: styles.hidden,
                                    labelStyle: styles.hidden,
                                    startIndex: wordStartIndex
                                }
                                nonEntities.push(substringObj)
                            }
                        }
                    } else {
                        //this some letter in the middle of the string
                        if (input[x] == " ") {
                            let substringObj: SubstringObject = {
                                text: input.substring(wordStartIndex, x),
                                entityName: null,
                                entityId: null,
                                rightBracketStyle: styles.hidden,
                                leftBracketStyle: styles.hidden,
                                //dropdown Style is going to have to depend on some state object. When you click an substring group with an entity it needs to go from styles.hidden to styles.normal
                                dropdownStyle: styles.hidden,
                                labelStyle: styles.hidden,
                                startIndex: wordStartIndex
                            }
                            let substringObjForSpace: SubstringObject = {
                                text: input.substring(x, x + 1),
                                entityName: null,
                                entityId: null,
                                rightBracketStyle: styles.hidden,
                                leftBracketStyle: styles.hidden,
                                //dropdown Style is going to have to depend on some state object. When you click an substring group with an entity it needs to go from styles.hidden to styles.normal
                                dropdownStyle: styles.hidden,
                                labelStyle: styles.hidden,
                                startIndex: x
                            }
                            nonEntities.push(substringObj)
                            nonEntities.push(substringObjForSpace)
                            wordStartIndex = x + 1
                        }
                    }
                }
                nonEntities.map((s: SubstringObject) => {
                    substringObjects.push(s)
                })
            } else {
                //is entity
                let substringObj: SubstringObject = {
                    text: input.substring(i.start, i.end),
                    entityName: i.entity.entityName,
                    entityId: i.entity.entityId,
                    rightBracketStyle: styles.rightBracketDisplayedBlack,
                    leftBracketStyle: styles.leftBracketDisplayedBlack,
                    //dropdown Style is going to have to depend on some state object. When you click an substring group with an entity it needs to go from styles.hidden to styles.normal
                    dropdownStyle: styles.hidden,
                    labelStyle: styles.labelDisplayed,
                    startIndex: i.start
                }
                substringObjects.push(substringObj)
            }
        })
        this.setState({
            substringObjects: substringObjects
        })
    }
    handleClick(s: SubstringObject) {
        let indexOfHoveredSubstring: number = this.findIndexOfHoveredSubstring(s);
        let allObjects = this.state.substringObjects;
        //hovering over a specified entity does nothing
        if (s.entityId === null) {
            if (this.state.substringClicked === null) {
                //havent clicked any string yet
                let newSubstringObj = { ...s, leftBracketStyle: styles.leftBracketDisplayedBlack, rightBracketStyle: styles.rightBracketDisplayedBlack }
                allObjects[indexOfHoveredSubstring] = newSubstringObj;
                this.setState({
                    substringObjects: allObjects
                })
            } else {
                //we already have an entity clicked but not set
                let sub: SubstringObject = this.state.substringClicked;
                if (s.startIndex < sub.startIndex) {
                    //place a gray bracket to left of hovered substring
                    let newSubstringObj = { ...s, leftBracketStyle: styles.leftBracketDisplayedBlack }
                    allObjects[indexOfHoveredSubstring] = newSubstringObj;
                    //now remove the left bracket for the clicked substring object
                    let indexOfClickedSubstring: number = this.findIndexOfHoveredSubstring(sub);
                    let newClickedSubstringObject = { ...sub, leftBracketStyle: styles.hidden, rightBracketStyle: styles.rightBracketDisplayedBlack };
                    allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
                    this.setState({
                        substringObjects: allObjects
                    })
                } else {
                    //place a gray bracket to right of hovered substring
                    let newSubstringObj = { ...s, rightBracketStyle: styles.rightBracketDisplayedBlack }
                    allObjects[indexOfHoveredSubstring] = newSubstringObj;
                    //now remove the right bracket for the clicked substring object
                    let indexOfClickedSubstring: number = this.findIndexOfHoveredSubstring(sub);
                    let newClickedSubstringObject = { ...sub, rightBracketStyle: styles.hidden, leftBracketStyle: styles.leftBracketDisplayedBlack, }
                    allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
                    this.setState({
                        substringObjects: allObjects
                    })
                }
            }
            this.setState({
                substringClicked: s,
                substringObjects: allObjects
            })
        } else {
            //make the dropdown reappear. The user can edit the entity that applies to this string
        }
    }
    findIndexOfHoveredSubstring(hovered: SubstringObject): number {
        let allObjects = this.state.substringObjects;
        let index: number;
        for (var i = 0; i < allObjects.length; i++) {
            if (allObjects[i].startIndex == hovered.startIndex) {
                index = i;
            }
        }
        return index;
    }
    handleHover(s: SubstringObject) {
        let indexOfHoveredSubstring: number = this.findIndexOfHoveredSubstring(s);
        let allObjects = this.state.substringObjects;
        let sub: SubstringObject = this.state.substringClicked;
        let currentHoverIsPreviouslyClickedSubstring = (sub !== null && sub.startIndex == s.startIndex)
        //hovering over a specified entity does nothing, similarly hovering over a clicked substring should maintain the black brackets
        if (s.entityId === null && currentHoverIsPreviouslyClickedSubstring == false) {
            if (this.state.substringClicked === null) {
                //havent clicked any string yet
                let newSubstringObj = { ...s, leftBracketStyle: styles.leftBracketDisplayedGray, rightBracketStyle: styles.rightBracketDisplayedGray }
                allObjects[indexOfHoveredSubstring] = newSubstringObj;
                this.setState({
                    substringObjects: allObjects
                })
            } else {
                //weve clicked a string and need to extend the bracket
                let sub: SubstringObject = this.state.substringClicked;
                if (s.startIndex < sub.startIndex) {
                    //place a gray bracket to left of hovered substring
                    let newSubstringObj = { ...s, leftBracketStyle: styles.leftBracketDisplayedGray }
                    allObjects[indexOfHoveredSubstring] = newSubstringObj;
                    //now remove the left bracket for the clicked substring object
                    let indexOfClickedSubstring: number = this.findIndexOfHoveredSubstring(sub);
                    let newClickedSubstringObject = { ...sub, leftBracketStyle: styles.hidden, rightBracketStyle: styles.rightBracketDisplayedBlack };
                    allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
                    this.setState({
                        substringObjects: allObjects
                    })
                } else {
                    //place a gray bracket to right of hovered substring
                    let newSubstringObj = { ...s, rightBracketStyle: styles.rightBracketDisplayedGray }
                    allObjects[indexOfHoveredSubstring] = newSubstringObj;
                    //now remove the right bracket for the clicked substring object
                    let indexOfClickedSubstring: number = this.findIndexOfHoveredSubstring(sub);
                    let newClickedSubstringObject = { ...sub, rightBracketStyle: styles.hidden, leftBracketStyle: styles.leftBracketDisplayedBlack, }
                    allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
                    this.setState({
                        substringObjects: allObjects
                    })
                }
            }
        }
    }
    handleHoverOut(s: SubstringObject) {
        let indexOfHoveredSubstring: number = this.findIndexOfHoveredSubstring(s);
        let allObjects = this.state.substringObjects;
        let sub: SubstringObject = this.state.substringClicked;
        let currentHoverIsPreviouslyClickedSubstring = (sub !== null && sub.startIndex == s.startIndex)
        if (s.entityId === null && currentHoverIsPreviouslyClickedSubstring == false) {
            if (this.state.substringClicked === null) {
                //havent clicked any string yet
                let newSubstringObj = { ...s, leftBracketStyle: styles.hidden, rightBracketStyle: styles.hidden }
                allObjects[indexOfHoveredSubstring] = newSubstringObj;
                this.setState({
                    substringObjects: allObjects
                })
            } else {
                //weve clicked a string and need to re add the bracket now that we've hovered out
                let sub: SubstringObject = this.state.substringClicked;
                if (s.startIndex < sub.startIndex) {
                    //place a gray bracket to left of hovered substring
                    let newSubstringObj = { ...s, leftBracketStyle: styles.hidden }
                    allObjects[indexOfHoveredSubstring] = newSubstringObj;
                    //now remove the left bracket for the clicked substring object
                    let indexOfClickedSubstring: number = this.findIndexOfHoveredSubstring(sub);
                    let newClickedSubstringObject = { ...sub, leftBracketStyle: styles.leftBracketDisplayedBlack, rightBracketStyle: styles.rightBracketDisplayedBlack };
                    allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
                    this.setState({
                        substringObjects: allObjects
                    })
                } else {
                    //place a gray bracket to right of hovered substring
                    let newSubstringObj = { ...s, rightBracketStyle: styles.hidden }
                    allObjects[indexOfHoveredSubstring] = newSubstringObj;
                    //now remove the right bracket for the clicked substring object
                    let indexOfClickedSubstring: number = this.findIndexOfHoveredSubstring(sub);
                    let newClickedSubstringObject = { ...sub, leftBracketStyle: styles.leftBracketDisplayedBlack, rightBracketStyle: styles.rightBracketDisplayedBlack }
                    allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
                    this.setState({
                        substringObjects: allObjects
                    })
                }
            }
        }
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
                    <span className='ms-font-xl' onClick={() => this.handleClick(s)} onMouseOver={() => this.handleHover(s)} onMouseLeave={() => this.handleHoverOut(s)}>{s.text}</span>
                    <span style={s.rightBracketStyle} className='ms-font-xxl'>]</span>
                </div>
                <Dropdown style={s.dropdownStyle} options={options} />
            </div>
        )
    }
    render() {
        let key: number = 0;
        return (
            <div className="extractorResponseBox">
                {this.state.substringObjects.map((s: SubstringObject) => {
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