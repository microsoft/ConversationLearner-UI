import { editActionAsync } from '../actions/updateActions';
import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ExtractResponse, TrainExtractorStep, PredictedEntity, LabeledEntity, EntityBase } from 'blis-models'
import { updateExtractResponse, removeExtractResponse } from '../actions/teachActions';
import { IconButton } from 'office-ui-fabric-react';
import { State } from '../types';
import { TextField, Dropdown, Label, IDropdownOption, DropdownMenuItemType } from 'office-ui-fabric-react'

interface PassedProps {
    extractResponse: ExtractResponse;
    isPrimary: boolean;
    isValid: boolean;
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
    rightBracketDisplayedWhite: {
        display: "inline-block",
        color: "white"
    },
    leftBracketDisplayedWhite: {
        display: "inline-block",
        color: "white"
    },
    rightBracketDisplayedBlack: {
        display: "inline-block",
        color: "black"
    },
    leftBracketDisplayedBlack: {
        display: "inline-block",
        color: "black"
    },
    rightBracketDisplayedGray: {
        display: "inline-block",
        color: "gray"
    },
    leftBracketDisplayedGray: {
        display: "inline-block",
        color: "gray"
    },
    containerDiv: {
        display: "inline-block",
        verticalAlign: "bottom",
        textAlign: "center"
    },
    spaceDiv: {
        display: "inline-block",
        verticalAlign: "bottom",
        textAlign: "center"
    },
    dropdownNormal: {
        marginTop: "5px",
        position: "absolute",
        minWidth: "12em",
        float: "left",
        textAlign: "left"
    }
}

class ExtractorResponseEditor extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            input: "",
            predictedEntities: [],
            substringObjects: null,
            substringsClicked: null,
        }
        this.renderSubstringObject = this.renderSubstringObject.bind(this)
        this.createSubstringObjects = this.createSubstringObjects.bind(this)
        this.handleClick = this.handleClick.bind(this)
        this.handleDeleteVariation = this.handleDeleteVariation.bind(this)
        this.handleHover = this.handleHover.bind(this)
        this.setInitialValues = this.setInitialValues.bind(this)
        this.findIndexOfHoveredSubstring = this.findIndexOfHoveredSubstring.bind(this)
        this.substringHasBeenClicked = this.substringHasBeenClicked.bind(this)
        this.findLeftMostClickedSubstring = this.findLeftMostClickedSubstring.bind(this)
        this.findRightMostClickedSubstring = this.findRightMostClickedSubstring.bind(this)
        this.isDefinedEntityBetweenClickedSubstrings = this.isDefinedEntityBetweenClickedSubstrings.bind(this)
        this.entitySelected = this.entitySelected.bind(this)
        this.getFullStringBetweenSubstrings = this.getFullStringBetweenSubstrings.bind(this)
        this.updateCurrentPredictedEntities = this.updateCurrentPredictedEntities.bind(this)
    }
    componentDidMount() {
        this.setInitialValues(this.props)
    }
    componentWillMount() {
        this.setInitialValues(this.props)
    }
    componentDidUpdate() {
        this.setInitialValues(this.props)
    }
    setInitialValues(props: any) {
        if (props.extractResponse.text && props.extractResponse.predictedEntities && (props.extractResponse.text !== this.state.input)) {
            this.setState({
                input: props.extractResponse.text,
                predictedEntities: props.extractResponse.predictedEntities
            })
            this.createSubstringObjects(props.extractResponse.text, props.extractResponse.predictedEntities)
        }
    }
    updateCurrentPredictedEntities(substringObjects: SubstringObject[]) {
        let predictions: PredictedEntity[] = [];
        substringObjects.map((s: SubstringObject) => {
            if (s.entityId !== null) {
                let predictedEntity: PredictedEntity = new PredictedEntity({
                    startCharIndex: s.startIndex,
                    endCharIndex: (s.startIndex + (s.text.length - 1)),
                    entityId: s.entityId,
                    entityName: s.entityName,
                    entityText: s.text,
                    metadata: this.props.entities.find((e: EntityBase) => e.entityName == s.entityName).metadata,
                    score: 1.0
                });
                predictions.push(predictedEntity);
            }
        })
        let newExtractResponse = new ExtractResponse({ text: this.state.input, predictedEntities: predictions });
        this.createSubstringObjects(this.state.input, predictions)
        this.props.updateExtractResponse(newExtractResponse)
        this.setState({
            predictedEntities: predictions
        })
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
        if (indexGroups.length == 0 && input.length == 1) {
            //single letter, would not be picked up by the loop below
            let substringObj: SubstringObject = {
                text: input,
                entityName: null,
                entityId: null,
                rightBracketStyle: styles.rightBracketDisplayedWhite,
                leftBracketStyle: styles.leftBracketDisplayedWhite,
                dropdownStyle: styles.hidden,
                labelStyle: styles.hidden,
                startIndex: 0
            }
            substringObjects.push(substringObj)
        }
        if (predictedEntities.length == 0) {
            let i: IndexGroup = {
                start: 0,
                end: input.length,
                entity: null
            }
            indexGroups.push(i)
        }
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
                                rightBracketStyle: styles.rightBracketDisplayedWhite,
                                leftBracketStyle: styles.leftBracketDisplayedWhite,
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
                                rightBracketStyle: styles.rightBracketDisplayedWhite,
                                leftBracketStyle: styles.leftBracketDisplayedWhite,
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
                                    rightBracketStyle: styles.rightBracketDisplayedWhite,
                                    leftBracketStyle: styles.leftBracketDisplayedWhite,
                                    //dropdown Style is going to have to depend on some state object. When you click an substring group with an entity it needs to go from styles.hidden to styles.normal
                                    dropdownStyle: styles.hidden,
                                    labelStyle: styles.hidden,
                                    startIndex: wordStartIndex
                                }
                                let substringObjForSpace: SubstringObject = {
                                    text: input.substring(x, x + 1),
                                    entityName: null,
                                    entityId: null,
                                    rightBracketStyle: styles.rightBracketDisplayedWhite,
                                    leftBracketStyle: styles.leftBracketDisplayedWhite,
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
                                    rightBracketStyle: styles.rightBracketDisplayedWhite,
                                    leftBracketStyle: styles.leftBracketDisplayedWhite,
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
                                rightBracketStyle: styles.rightBracketDisplayedWhite,
                                leftBracketStyle: styles.leftBracketDisplayedWhite,
                                //dropdown Style is going to have to depend on some state object. When you click an substring group with an entity it needs to go from styles.hidden to styles.normal
                                dropdownStyle: styles.hidden,
                                labelStyle: styles.hidden,
                                startIndex: wordStartIndex
                            }
                            let substringObjForSpace: SubstringObject = {
                                text: input.substring(x, x + 1),
                                entityName: null,
                                entityId: null,
                                rightBracketStyle: styles.rightBracketDisplayedWhite,
                                leftBracketStyle: styles.leftBracketDisplayedWhite,
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
                    labelStyle: styles.normal,
                    startIndex: i.start
                }
                substringObjects.push(substringObj)
            }
        })
        this.setState({
            substringObjects: substringObjects
        })
    }
    substringHasBeenClicked(s: SubstringObject): boolean {
        let result: boolean = false;
        if (this.state.substringsClicked !== null) {
            this.state.substringsClicked.map((sub: SubstringObject) => {
                if (sub.startIndex == s.startIndex) {
                    result = true
                }
            })
        }
        return result;
    }
    findLeftMostClickedSubstring(): SubstringObject {
        let min: SubstringObject = this.state.substringsClicked[0];
        this.state.substringsClicked.map((sub: SubstringObject) => {
            if (sub.startIndex < min.startIndex) {
                min = sub
            }
        })
        let objWithPersistentClassInfo = this.state.substringObjects.find((s: SubstringObject) => s.startIndex == min.startIndex)
        return objWithPersistentClassInfo;
    }
    findRightMostClickedSubstring(): SubstringObject {
        let min: SubstringObject = this.state.substringsClicked[0];
        this.state.substringsClicked.map((sub: SubstringObject) => {
            if (sub.startIndex > min.startIndex) {
                min = sub
            }
        })
        let objWithPersistentClassInfo = this.state.substringObjects.find((s: SubstringObject) => s.startIndex == min.startIndex)
        return objWithPersistentClassInfo;
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
    isDefinedEntityBetweenClickedSubstrings(startIndex: number, endIndex: number): boolean {
        let result: boolean = false;
        if (this.state.substringsClicked !== null) {
            let entityStartIndexes: number[] = this.state.substringObjects.map((s: SubstringObject) => {
                if (s.entityId !== null) {
                    return s.startIndex;
                }
            })
            entityStartIndexes.map((entityStartIndex: number) => {
                if (startIndex < entityStartIndex && endIndex > entityStartIndex) {
                    result = true
                }
            })
        }
        return result;
    }
    removeBracketsFromAllSelectedSubstrings() {
        let allObjects = this.state.substringObjects;
        let clickedObjects = this.state.substringsClicked;
        clickedObjects.map((c: SubstringObject) => {
            let indexOfClickedSubstring: number = this.findIndexOfHoveredSubstring(c);
            let newClickedSubstringObject = { ...c, leftBracketStyle: styles.leftBracketDisplayedWhite, rightBracketStyle: styles.rightBracketDisplayedWhite, dropdownStyle: styles.hidden }
            allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
        })
        this.setState({
            substringObjects: allObjects
        })
    }
    handleClick(s: SubstringObject) {
        let indexOfHoveredSubstring: number = this.findIndexOfHoveredSubstring(s);
        let allObjects = this.state.substringObjects;
        let updateClickedSubstrings: boolean = true;
        //hovering over a specified entity does nothing
        if (s.entityId === null) {
            if (this.state.substringsClicked === null) {
                //havent clicked any strings yet
                let newSubstringObj = { ...s, leftBracketStyle: styles.leftBracketDisplayedBlack, rightBracketStyle: styles.rightBracketDisplayedBlack, dropdownStyle: styles.dropdownNormal }
                allObjects[indexOfHoveredSubstring] = newSubstringObj;
                this.setState({
                    substringObjects: allObjects
                })
            } else {
                if (this.substringHasBeenClicked(s) === true) {
                    //user has clicked into the already clicked string/group of strings. We need to remove the brackets around all clicked but not set strings, and remove the dropwdowns currently displayed underneath them
                    this.removeBracketsFromAllSelectedSubstrings();
                    this.setState({
                        substringsClicked: null
                    })
                    updateClickedSubstrings = false
                } else {
                    //we already have an entity clicked but not set, and this is a different string than has previously been clicked
                    let left: SubstringObject = this.findLeftMostClickedSubstring();
                    let right: SubstringObject = this.findRightMostClickedSubstring();
                    if (s.startIndex < left.startIndex && (this.isDefinedEntityBetweenClickedSubstrings(s.startIndex, left.startIndex) == false)) {
                        //place a gray bracket to left of hovered substring
                        let newSubstringObj = { ...s, leftBracketStyle: styles.leftBracketDisplayedBlack }
                        allObjects[indexOfHoveredSubstring] = newSubstringObj;
                        //now remove the left bracket for the leftmost clicked substring object
                        let indexOfClickedSubstring: number = this.findIndexOfHoveredSubstring(left);
                        let newClickedSubstringObject = { ...left, leftBracketStyle: styles.leftBracketDisplayedWhite, rightBracketStyle: styles.rightBracketDisplayedBlack };
                        allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
                        this.setState({
                            substringObjects: allObjects
                        })
                    } else if (s.startIndex > right.startIndex && (this.isDefinedEntityBetweenClickedSubstrings(right.startIndex, s.startIndex) == false)) {
                        //place a gray bracket to right of hovered substring
                        let newSubstringObj = { ...s, rightBracketStyle: styles.rightBracketDisplayedBlack }
                        allObjects[indexOfHoveredSubstring] = newSubstringObj;
                        //now remove the right bracket for the rightmost clicked substring object
                        let indexOfClickedSubstring: number = this.findIndexOfHoveredSubstring(right);
                        let newClickedSubstringObject = { ...right, rightBracketStyle: styles.rightBracketDisplayedWhite, leftBracketStyle: styles.leftBracketDisplayedBlack, }
                        allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
                        this.setState({
                            substringObjects: allObjects
                        })
                    }

                }
            }
            if (updateClickedSubstrings === true) {
                let currentlyClicked: SubstringObject[] = this.state.substringsClicked === null ? [] : this.state.substringsClicked;
                this.setState({
                    substringsClicked: [...currentlyClicked, s]
                })
            }
        } else {
            //make the dropdown reappear. The user can edit the entity that applies to this string
            let style: {} = styles.hidden;
            if (s.dropdownStyle === styles.hidden) {
                style = styles.dropdownNormal
            }
            let newSubstringObj = { ...s, dropdownStyle: style }
            allObjects[indexOfHoveredSubstring] = newSubstringObj;
            this.setState({
                substringObjects: allObjects
            })
        }
    }
    handleHover(s: SubstringObject) {
        let indexOfHoveredSubstring: number = this.findIndexOfHoveredSubstring(s);
        let allObjects = this.state.substringObjects;
        let currentHoverIsPreviouslyClickedSubstring = this.substringHasBeenClicked(s)

        //hovering over a specified entity does nothing, similarly hovering over a clicked substring should maintain the black brackets
        if (s.entityId === null && currentHoverIsPreviouslyClickedSubstring === false) {
            if (this.state.substringsClicked === null) {
                //havent clicked any strings yet
                let newSubstringObj = { ...s, leftBracketStyle: styles.leftBracketDisplayedGray, rightBracketStyle: styles.rightBracketDisplayedGray }
                allObjects[indexOfHoveredSubstring] = newSubstringObj;
                this.setState({
                    substringObjects: allObjects
                })
            } else {
                //weve clicked a string and need to extend the bracket
                let left: SubstringObject = this.findLeftMostClickedSubstring();
                let right: SubstringObject = this.findRightMostClickedSubstring();
                if (s.startIndex < left.startIndex && (this.isDefinedEntityBetweenClickedSubstrings(s.startIndex, left.startIndex) == false)) {
                    //place a gray bracket to left of hovered substring
                    let newSubstringObj = { ...s, leftBracketStyle: styles.leftBracketDisplayedGray }
                    allObjects[indexOfHoveredSubstring] = newSubstringObj;
                    //now remove the left bracket for the clicked substring object
                    let indexOfClickedSubstring: number = this.findIndexOfHoveredSubstring(left);
                    let newClickedSubstringObject = { ...left, leftBracketStyle: styles.leftBracketDisplayedWhite, rightBracketStyle: styles.rightBracketDisplayedBlack };
                    allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
                    this.setState({
                        substringObjects: allObjects
                    })
                } else if (s.startIndex > right.startIndex && (this.isDefinedEntityBetweenClickedSubstrings(right.startIndex, s.startIndex) == false)) {
                    //place a gray bracket to right of hovered substring
                    let newSubstringObj = { ...s, rightBracketStyle: styles.rightBracketDisplayedGray }
                    allObjects[indexOfHoveredSubstring] = newSubstringObj;
                    //now remove the right bracket for the clicked substring object
                    let indexOfClickedSubstring: number = this.findIndexOfHoveredSubstring(right);
                    let newClickedSubstringObject = { ...right, rightBracketStyle: styles.rightBracketDisplayedWhite, leftBracketStyle: styles.leftBracketDisplayedBlack, }
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
        let currentHoverIsPreviouslyClickedSubstring = this.substringHasBeenClicked(s)
        if (s.entityId === null && currentHoverIsPreviouslyClickedSubstring == false) {
            if (this.state.substringsClicked === null) {
                //havent clicked any string yet
                let newSubstringObj = { ...s, leftBracketStyle: styles.leftBracketDisplayedWhite, rightBracketStyle: styles.rightBracketDisplayedWhite }
                allObjects[indexOfHoveredSubstring] = newSubstringObj;
                this.setState({
                    substringObjects: allObjects
                })
            } else {
                let left: SubstringObject = this.findLeftMostClickedSubstring();
                let right: SubstringObject = this.findRightMostClickedSubstring();
                if (s.startIndex < left.startIndex && (this.isDefinedEntityBetweenClickedSubstrings(s.startIndex, left.startIndex) == false)) {
                    //place a gray bracket to left of hovered substring
                    let newSubstringObj = { ...s, leftBracketStyle: styles.leftBracketDisplayedWhite }
                    allObjects[indexOfHoveredSubstring] = newSubstringObj;
                    //now remove the left bracket for the clicked substring object
                    let indexOfClickedSubstring: number = this.findIndexOfHoveredSubstring(left);
                    let newClickedSubstringObject = { ...left, leftBracketStyle: styles.leftBracketDisplayedBlack };
                    allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
                    this.setState({
                        substringObjects: allObjects
                    })
                } else if (s.startIndex > right.startIndex && (this.isDefinedEntityBetweenClickedSubstrings(right.startIndex, s.startIndex) == false)) {
                    //place a gray bracket to right of hovered substring
                    let newSubstringObj = { ...s, rightBracketStyle: styles.rightBracketDisplayedWhite }
                    allObjects[indexOfHoveredSubstring] = newSubstringObj;
                    //now remove the right bracket for the clicked substring object
                    let indexOfClickedSubstring: number = this.findIndexOfHoveredSubstring(right);
                    let newClickedSubstringObject = { ...right, rightBracketStyle: styles.rightBracketDisplayedBlack }
                    allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
                    this.setState({
                        substringObjects: allObjects
                    })
                }
            }
        }
    }
    getFullStringBetweenSubstrings(left: SubstringObject, right: SubstringObject): string {
        let fullString: string = "";
        this.state.substringObjects.map((s: SubstringObject) => {
            if ((s.startIndex >= left.startIndex) && (s.startIndex <= right.startIndex)) {
                fullString += s.text;
            }
        })
        return fullString;
    }
    entitySelected(obj: { text: string }, substringClicked: SubstringObject) {
        //is this thing already an entity or was it a string before?
        let indexOfClickedSubstring: number = this.findIndexOfHoveredSubstring(substringClicked);
        let entitySelected: EntityBase = this.props.entities.find((e: EntityBase) => e.entityName == obj.text)
        let allObjects = this.state.substringObjects;

        if (substringClicked.entityId === null) {
            let currentlyClickedSubstrings = this.state.substringsClicked;
            if (this.state.substringsClicked.length == 1) {
                let newClickedSubstringObject: SubstringObject = { ...substringClicked, entityName: entitySelected.entityName, entityId: entitySelected.entityId, dropdownStyle: styles.hidden, labelStyle: styles.normal }
                allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
                this.setState({
                    substringObjects: allObjects
                })
            } else if (this.state.substringsClicked.length > 1) {
                //1. set the entity and styling for the leftmost substring object 
                //2. remove all substring objects after the first one up to the second substring object 
                //3. set the state
                let left: SubstringObject = this.findLeftMostClickedSubstring();
                let right: SubstringObject = this.findRightMostClickedSubstring();
                let allObjectsBeforeLeftmost: SubstringObject[] = []
                let allObjectsAfterRightmost: SubstringObject[] = [];

                this.state.substringObjects.map((s: SubstringObject) => {
                    if (s.startIndex < left.startIndex) {
                        allObjectsBeforeLeftmost.push(s);
                    } else if (s.startIndex > right.startIndex) {
                        allObjectsAfterRightmost.push(s)
                    }
                })
                let newText = this.getFullStringBetweenSubstrings(left, right);
                let newClickedSubstringObject = { ...left, rightBracketStyle: styles.rightBracketDisplayedBlack, entityName: entitySelected.entityName, entityId: entitySelected.entityId, dropdownStyle: styles.hidden, labelStyle: styles.normal, text: newText };
                allObjects = [...allObjectsBeforeLeftmost, newClickedSubstringObject, ...allObjectsAfterRightmost];
                this.setState({
                    substringObjects: allObjects
                })
            }
            this.setState({
                substringsClicked: null
            })
        } else {
            if (obj.text.toLowerCase() == 'remove') {
                let newClickedSubstringObject: SubstringObject = { ...substringClicked, entityName: null, entityId: null, dropdownStyle: styles.hidden, leftBracketStyle: styles.leftBracketDisplayedWhite, rightBracketStyle: styles.rightBracketDisplayedWhite }
                allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
                this.setState({
                    substringObjects: allObjects
                })
            } else {
                let newClickedSubstringObject: SubstringObject = { ...substringClicked, entityName: entitySelected.entityName, entityId: entitySelected.entityId, dropdownStyle: styles.hidden }
                allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
                this.setState({
                    substringObjects: allObjects
                })
            }
        }
        this.updateCurrentPredictedEntities(allObjects)
    }
    getAlphabetizedEntityOptions(): IDropdownOption[] {
        let names: string[] = this.props.entities.map((e: EntityBase) => {
            return e.entityName;
        })
        let ordered = names.sort();
        let options: IDropdownOption[] = names.map((name: string) => {
            let ent: EntityBase = this.props.entities.find((e: EntityBase) => e.entityName == name);
            return {
                key: ent.entityName,
                text: ent.entityName
            }
        })
        return options;
    }
    renderSubstringObject(s: SubstringObject, key: number) {
        let allOptions: IDropdownOption[] = this.getAlphabetizedEntityOptions();
        let options: IDropdownOption[] = allOptions.filter((o: IDropdownOption) => {
            let found: PredictedEntity = this.state.predictedEntities.find((p: PredictedEntity) => p.entityName == o.text);
            if (found && (!found.metadata || found.metadata.isBucket == false)) {
                return false;
            }
            return true;
        })
        if (s.entityId !== null) {
            options.unshift({
                key: "Divider",
                text: "",
                itemType: DropdownMenuItemType.Divider
            })
            options.unshift({
                key: "Remove",
                text: "Remove"
            })
        }
        if (s.text != " ") {
            return (
                <div key={key} className="extractDiv" style={styles.containerDiv}>
                    <span style={s.labelStyle} className='ms-font-xs'>{s.entityName}</span>
                    <div style={styles.normal}>
                        <span style={s.leftBracketStyle} className='ms-font-xl'>[</span>
                        <span className='ms-font-m' onClick={() => this.handleClick(s)} onMouseOver={() => this.handleHover(s)} onMouseLeave={() => this.handleHoverOut(s)}>{s.text}</span>
                        <span style={s.rightBracketStyle} className='ms-font-xl'>]</span>
                    </div>
                    <div style={s.dropdownStyle}>
                        <Dropdown
                            className='ms-font-m'
                            placeHolder="Select an Entity"
                            options={options}
                            selectedKey={null}
                            onChanged={(obj) => {
                                this.entitySelected(obj, s)
                            }}
                        />
                    </div>
                </div>
            )
        }
    }
    handleDeleteVariation() {
        let removedResponse = new ExtractResponse({ text: this.state.input, predictedEntities: [] });
        this.props.removeExtractResponse(removedResponse);
        this.setState({
            variationValue: ''
        })
    }
    render() {
        let key: number = 0;
        let boxClass = this.props.isValid ? 'extractorResponseBox' : 'extractorResponseBox extractorResponseBoxInvalid';
        let button = this.props.isPrimary ? null :
            <div>
                <a onClick={() => this.handleDeleteVariation()}><span className="teachDeleteVariation ms-Icon ms-Icon--Delete"></span></a>
            </div>
        return (
            <div className='teachVariationBox'>
                {button}
                <div className='teachVariation'>
                    <div className={boxClass}>
                        {this.state.substringObjects.map((s: SubstringObject) => {
                            return this.renderSubstringObject(s, ++key)
                        })}
                    </div>
                </div>
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        updateExtractResponse: updateExtractResponse,
        removeExtractResponse: removeExtractResponse
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        entities: state.entities
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ExtractorResponseEditor as React.ComponentClass<any>);