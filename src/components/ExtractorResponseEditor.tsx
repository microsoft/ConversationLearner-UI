import * as React from 'react';
import "./ExtractorResponseEditor.css"
import { bindActionCreators } from 'redux';
import { returntypeof } from 'react-redux-typescript';
import { connect } from 'react-redux';
import { ExtractResponse, PredictedEntity, EntityBase, AppDefinition, EntityType } from 'blis-models'
import { State } from '../types';
import { Dropdown, IDropdownOption, DropdownMenuItemType } from 'office-ui-fabric-react';

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

export interface BlisDropdownOption extends IDropdownOption {
    style: string
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
        textAlign: "left",
        zIndex: "5000"
    }
}

interface ComponentState {
    input: string;
    predictedEntities: PredictedEntity[];
    definitions: AppDefinition;
    substringObjects: SubstringObject[];
    substringsClicked: SubstringObject[];
    insideExtractor: boolean;
    newEntityIndex: number;
    newEntityText: string;
}

class ExtractorResponseEditor extends React.Component<Props, ComponentState> {
    constructor(p: any) {
        super(p);
        this.state = {
            input: "",
            predictedEntities: [],
            definitions: null,
            substringObjects: [],
            substringsClicked: [],
            insideExtractor: false,
            newEntityIndex: null,
            newEntityText: null
        }
        this.renderSubstringObject = this.renderSubstringObject.bind(this)
        this.createSubstringObjects = this.createSubstringObjects.bind(this)
        this.onClickText = this.onClickText.bind(this)
        this.handleDeleteVariation = this.handleDeleteVariation.bind(this)
        this.onHoverText = this.onHoverText.bind(this)
        this.setInitialValues = this.setInitialValues.bind(this)
        this.findIndexOfHoveredSubstring = this.findIndexOfHoveredSubstring.bind(this)
        this.substringHasBeenClicked = this.substringHasBeenClicked.bind(this)
        this.findLeftMostClickedSubstring = this.findLeftMostClickedSubstring.bind(this)
        this.findRightMostClickedSubstring = this.findRightMostClickedSubstring.bind(this)
        this.isDefinedEntityBetweenClickedSubstrings = this.isDefinedEntityBetweenClickedSubstrings.bind(this)
        this.onDropdownEntitySelected = this.onDropdownEntitySelected.bind(this)
        this.getFullStringBetweenSubstrings = this.getFullStringBetweenSubstrings.bind(this)
        this.updateCurrentPredictedEntities = this.updateCurrentPredictedEntities.bind(this)
    }

    componentWillReceiveProps(newProps: Props) {
        // If a new entity is present, one of the substrings might bewaiting for it
        if (newProps.entities.length > this.props.entities.length) {
            // Find the new entity
            let newEntity = newProps.entities.filter(ne => {
                let fe = this.props.entities.find(e => e.entityId == ne.entityId);
                return fe == undefined;
            })[0];

            // If one is found and substring is waiting
            if (newEntity && this.state.newEntityText) {

                let predictedEntity = new PredictedEntity({
                    startCharIndex: this.state.newEntityIndex,
                    endCharIndex: (this.state.newEntityIndex + (this.state.newEntityText.length - 1)),
                    entityId: newEntity.entityId,
                    entityName: newEntity.entityName,
                    entityText: this.state.newEntityText,
                    metadata: newProps.entities.find(e => e.entityName == newEntity.entityName).metadata,
                    score: 1.0
                });
                let newPredictions = [...this.props.extractResponse.predictedEntities, predictedEntity];
                let newExtractResponse = new ExtractResponse({ text: this.state.input, predictedEntities: newPredictions, definitions: this.state.definitions });
                this.props.updateExtractResponse(newExtractResponse)
                this.setState({
                    predictedEntities: newPredictions
                });
            }
        }
        this.setInitialValues(newProps);
    }
    componentDidMount() {
        this.setInitialValues(this.props)
    }
    setInitialValues(props: Props) {
        this.setState({
            input: props.extractResponse.text,
            predictedEntities: props.extractResponse.predictedEntities,
            definitions: props.extractResponse.definitions
        })
        this.createSubstringObjects(props.extractResponse.text, props.extractResponse.predictedEntities);
    }
    updateCurrentPredictedEntities(substringObjects: SubstringObject[], entities: EntityBase[]) {
        let predictions: PredictedEntity[] = [];
        substringObjects.map(s => {
            if (s.entityId !== null) {
                let predictedEntity = new PredictedEntity({
                    startCharIndex: s.startIndex,
                    endCharIndex: (s.startIndex + (s.text.length - 1)),
                    entityId: s.entityId,
                    entityName: s.entityName,
                    entityText: s.text,
                    metadata: entities.find(e => e.entityName == s.entityName).metadata,
                    score: 1.0
                });
                predictions.push(predictedEntity);
            }
        })
        let newExtractResponse = new ExtractResponse({ text: this.state.input, predictedEntities: predictions, definitions: this.state.definitions });
        this.props.updateExtractResponse(newExtractResponse)
        this.setState({
            predictedEntities: predictions
        })
    }
    sortByStartIndexes(predictions: PredictedEntity[]): PredictedEntity[] {
        let predictedEntities: PredictedEntity[] = [];
        let indexes: number[] = predictions.map((p: PredictedEntity) => {
            return p.startCharIndex
        });
        let sortedIndexes = indexes.sort((a: number, b: number) => {
            return a - b;
        });
        predictedEntities = sortedIndexes.map((n: number) => {
            return predictions.find((pe: PredictedEntity) => pe.startCharIndex === n);
        })
        return predictedEntities;
    }
    createSubstringObjects(input: string, predictions: PredictedEntity[]): void {
        let predictedEntities: PredictedEntity[] = this.sortByStartIndexes(predictions);
        let indexGroups: IndexGroup[] = [];
        let count: number = 0;
        let currentIndexGroup: IndexGroup = {
            start: 0,
            end: null,
            entity: null
        }
        predictedEntities.map(p => {
            if (count == 0) {
                if (p.startCharIndex == 0) {
                    //handle the case where the first character of the input is part of an entity
                    currentIndexGroup = { ...currentIndexGroup, end: p.endCharIndex + 1, entity: this.props.entities.find(e => e.entityId == p.entityId) }
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
                    currentIndexGroup = { ...currentIndexGroup, start: p.startCharIndex, end: p.endCharIndex + 1, entity: this.props.entities.find(e => e.entityId == p.entityId) }
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
                    currentIndexGroup = { ...currentIndexGroup, end: p.endCharIndex, entity: this.props.entities.find(e => e.entityId == p.entityId) }
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
                    currentIndexGroup = { ...currentIndexGroup, start: p.startCharIndex, end: p.endCharIndex + 1, entity: this.props.entities.find(e => e.entityId == p.entityId) }
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
            if (i.entity == null) {
                //is string
                let nonEntities: SubstringObject[] = [];
                let wordStartIndex: number;
                if (i.end - i.start == 1) {
                    let substringObj: SubstringObject = {
                        text: input.substring(i.start, i.end),
                        entityName: null,
                        entityId: null,
                        rightBracketStyle: styles.rightBracketDisplayedWhite,
                        leftBracketStyle: styles.leftBracketDisplayedWhite,
                        //dropdown Style is going to have to depend on some state object. When you click an substring group with an entity it needs to go from styles.hidden to styles.normal
                        dropdownStyle: styles.hidden,
                        labelStyle: styles.hidden,
                        startIndex: i.start
                    }
                    substringObjects.push(substringObj)
                } else {
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
                    nonEntities.map(s => {
                        substringObjects.push(s)
                    })
                }
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
            substringObjects: this.parsePunctuationFromSubstrings(substringObjects)
        })
    }
    substringHasBeenClicked(s: SubstringObject): boolean {
        let result: boolean = false;
        if (this.state.substringsClicked.length > 0) {
            this.state.substringsClicked.map(sub => {
                if (sub.startIndex == s.startIndex) {
                    result = true
                }
            })
        }
        return result;
    }
    findLeftMostClickedSubstring(): SubstringObject {
        let min: SubstringObject = this.state.substringsClicked[0];
        this.state.substringsClicked.map(sub => {
            if (sub.startIndex < min.startIndex) {
                min = sub
            }
        })
        let objWithPersistentClassInfo = this.state.substringObjects.find(s => s.startIndex == min.startIndex)
        return objWithPersistentClassInfo;
    }
    findRightMostClickedSubstring(): SubstringObject {
        let min: SubstringObject = this.state.substringsClicked[0];
        this.state.substringsClicked.map(sub => {
            if (sub.startIndex > min.startIndex) {
                min = sub
            }
        })
        let objWithPersistentClassInfo = this.state.substringObjects.find(s => s.startIndex == min.startIndex)
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
        let result = false;
        if (this.state.substringsClicked.length > 0) {
            // TODO: This array may have holes of undefined in it, how can it be iterated without filtring?
            let entityStartIndexes: number[] = this.state.substringObjects.map(s => (s.entityId !== null) ? s.startIndex : undefined)
            entityStartIndexes.map(entityStartIndex => {
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
        clickedObjects.map(c => {
            let indexOfClickedSubstring: number = this.findIndexOfHoveredSubstring(c);
            let newClickedSubstringObject = { ...c, leftBracketStyle: styles.leftBracketDisplayedWhite, rightBracketStyle: styles.rightBracketDisplayedWhite, dropdownStyle: styles.hidden }
            allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
        })
        this.setState({
            substringObjects: allObjects
        })
    }
    onClickText(s: SubstringObject) {
        if (!this.props.canEdit) {
            return;
        }
        let indexOfHoveredSubstring = this.findIndexOfHoveredSubstring(s);
        let allObjects = this.state.substringObjects;
        let updateClickedSubstrings = true;
        //hovering over a specified entity does nothing
        if (s.entityId === null) {
            if (this.state.substringsClicked.length == 0) {
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
                        substringsClicked: []
                    })
                    updateClickedSubstrings = false
                } else {
                    //we already have an entity clicked but not set, and this is a different string than has previously been clicked
                    let left = this.findLeftMostClickedSubstring();
                    let right = this.findRightMostClickedSubstring();
                    if (s.startIndex < left.startIndex && (this.isDefinedEntityBetweenClickedSubstrings(s.startIndex, left.startIndex) == false)) {
                        //place a gray bracket to left of hovered substring
                        let newSubstringObj = { ...s, leftBracketStyle: styles.leftBracketDisplayedBlack }
                        allObjects[indexOfHoveredSubstring] = newSubstringObj;
                        //now remove the left bracket for the leftmost clicked substring object
                        let indexOfClickedSubstring = this.findIndexOfHoveredSubstring(left);

                        let newClickedSubstringObject: SubstringObject;
                        if (this.state.substringsClicked.length < 2) {
                            newClickedSubstringObject = { ...left, leftBracketStyle: styles.leftBracketDisplayedWhite, rightBracketStyle: styles.rightBracketDisplayedBlack };
                        } else {
                            newClickedSubstringObject = { ...left, leftBracketStyle: styles.leftBracketDisplayedWhite };
                        }
                        allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
                        this.setState({
                            substringObjects: allObjects
                        })
                    } else if (s.startIndex > right.startIndex && (this.isDefinedEntityBetweenClickedSubstrings(right.startIndex, s.startIndex) == false)) {
                        //place a gray bracket to right of hovered substring
                        let newSubstringObj = { ...s, rightBracketStyle: styles.rightBracketDisplayedBlack }
                        allObjects[indexOfHoveredSubstring] = newSubstringObj;
                        //now remove the right bracket for the rightmost clicked substring object
                        let indexOfClickedSubstring = this.findIndexOfHoveredSubstring(right);
                        let newClickedSubstringObject: SubstringObject;
                        if (this.state.substringsClicked.length < 2) {
                            newClickedSubstringObject = { ...right, rightBracketStyle: styles.rightBracketDisplayedWhite, leftBracketStyle: styles.leftBracketDisplayedBlack, }
                        } else {
                            newClickedSubstringObject = { ...right, rightBracketStyle: styles.rightBracketDisplayedWhite }
                        }
                        allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
                        this.setState({
                            substringObjects: allObjects
                        })
                    }
                }
            }
            if (updateClickedSubstrings === true) {
                let currentlyClicked: SubstringObject[] = this.state.substringsClicked.length == 0 ? [] : this.state.substringsClicked;
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
    onHoverText(s: SubstringObject) {
        if (!this.props.canEdit) {
            return;
        }
        let indexOfHoveredSubstring = this.findIndexOfHoveredSubstring(s);
        let allObjects = this.state.substringObjects;
        let currentHoverIsPreviouslyClickedSubstring = this.substringHasBeenClicked(s)

        //hovering over a specified entity does nothing, similarly hovering over a clicked substring should maintain the black brackets
        if (s.entityId === null && currentHoverIsPreviouslyClickedSubstring === false && (s.text.length == 1 && this.includesPunctuation(s.text)) == false) {
            if (this.state.substringsClicked.length == 0) {
                //havent clicked any strings yet
                let newSubstringObj = { ...s, leftBracketStyle: styles.leftBracketDisplayedGray, rightBracketStyle: styles.rightBracketDisplayedGray }
                allObjects[indexOfHoveredSubstring] = newSubstringObj;
                this.setState({
                    substringObjects: allObjects
                })
            } else {
                //weve clicked a string and need to extend the bracket
                let left = this.findLeftMostClickedSubstring();
                let right = this.findRightMostClickedSubstring();
                if (s.startIndex < left.startIndex && (this.isDefinedEntityBetweenClickedSubstrings(s.startIndex, left.startIndex) == false)) {
                    //place a gray bracket to left of hovered substring
                    let newSubstringObj = { ...s, leftBracketStyle: styles.leftBracketDisplayedGray }
                    allObjects[indexOfHoveredSubstring] = newSubstringObj;
                    //now remove the left bracket for the clicked substring object
                    let indexOfClickedSubstring = this.findIndexOfHoveredSubstring(left);
                    let newClickedSubstringObject: SubstringObject;
                    if (this.state.substringsClicked.length < 2) {
                        newClickedSubstringObject = { ...left, leftBracketStyle: styles.leftBracketDisplayedWhite, rightBracketStyle: styles.rightBracketDisplayedBlack };
                    } else {
                        newClickedSubstringObject = { ...left, leftBracketStyle: styles.leftBracketDisplayedWhite };
                    }
                    allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
                    this.setState({
                        substringObjects: allObjects
                    })
                } else if (s.startIndex > right.startIndex && (this.isDefinedEntityBetweenClickedSubstrings(right.startIndex, s.startIndex) == false)) {
                    //place a gray bracket to right of hovered substring
                    let newSubstringObj = { ...s, rightBracketStyle: styles.rightBracketDisplayedGray }
                    allObjects[indexOfHoveredSubstring] = newSubstringObj;
                    //now remove the right bracket for the clicked substring object
                    let indexOfClickedSubstring = this.findIndexOfHoveredSubstring(right);
                    let newClickedSubstringObject: SubstringObject;
                    if (this.state.substringsClicked.length < 2) {
                        newClickedSubstringObject = { ...right, rightBracketStyle: styles.rightBracketDisplayedWhite, leftBracketStyle: styles.leftBracketDisplayedBlack, }
                    } else {
                        newClickedSubstringObject = { ...right, rightBracketStyle: styles.rightBracketDisplayedWhite }
                    }
                    allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
                    this.setState({
                        substringObjects: allObjects
                    })
                }
            }
        }
    }
    onUnhoverText(s: SubstringObject) {
        let indexOfHoveredSubstring = this.findIndexOfHoveredSubstring(s);
        let allObjects = this.state.substringObjects;
        let currentHoverIsPreviouslyClickedSubstring = this.substringHasBeenClicked(s)
        if (s.entityId === null && currentHoverIsPreviouslyClickedSubstring == false && (s.text.length == 1 && this.includesPunctuation(s.text)) == false) {
            if (this.state.substringsClicked.length == 0) {
                //havent clicked any string yet
                let newSubstringObj = { ...s, leftBracketStyle: styles.leftBracketDisplayedWhite, rightBracketStyle: styles.rightBracketDisplayedWhite }
                allObjects[indexOfHoveredSubstring] = newSubstringObj;
                this.setState({
                    substringObjects: allObjects
                })
            } else {
                let left = this.findLeftMostClickedSubstring();
                let right = this.findRightMostClickedSubstring();
                if (s.startIndex < left.startIndex && (this.isDefinedEntityBetweenClickedSubstrings(s.startIndex, left.startIndex) == false)) {
                    //place a gray bracket to left of hovered substring
                    let newSubstringObj = { ...s, leftBracketStyle: styles.leftBracketDisplayedWhite }
                    allObjects[indexOfHoveredSubstring] = newSubstringObj;
                    //now remove the left bracket for the clicked substring object
                    let indexOfClickedSubstring = this.findIndexOfHoveredSubstring(left);
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
                    let indexOfClickedSubstring = this.findIndexOfHoveredSubstring(right);
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
        this.state.substringObjects.map(s => {
            if ((s.startIndex >= left.startIndex) && (s.startIndex <= right.startIndex)) {
                fullString += s.text;
            }
        })
        return fullString;
    }
    onRenderOption = (option: BlisDropdownOption): JSX.Element => {
        return (
            <div className='dropdownExample-option'>
                <span className={option.style}>{option.text}</span>
            </div>
        );
    }
    // Merge two substrings and return new substring list
    mergeSubstrings(left: SubstringObject, right: SubstringObject, entity: EntityBase): SubstringObject[] {
        let allObjectsBeforeLeftmost: SubstringObject[] = []
        let allObjectsAfterRightmost: SubstringObject[] = [];

        this.state.substringObjects.map(s => {
            if (s.startIndex < left.startIndex) {
                allObjectsBeforeLeftmost.push(s);
            } else if (s.startIndex > right.startIndex) {
                allObjectsAfterRightmost.push(s)
            }
        })
        let newText = this.getFullStringBetweenSubstrings(left, right);
        let newClickedSubstringObject = {
            ...left,
            rightBracketStyle: styles.rightBracketDisplayedBlack,
            entityName: entity ? entity.entityName : null,
            entityId: entity ? entity.entityId : null,
            dropdownStyle: styles.hidden,
            labelStyle: styles.normal,
            text: newText
        };
        return [...allObjectsBeforeLeftmost, newClickedSubstringObject, ...allObjectsAfterRightmost];
    }
    onDropdownEntitySelected(obj: { text: string }, substringClicked: SubstringObject) {
        //is this thing already an entity or was it a string before?
        let indexOfClickedSubstring: number = this.findIndexOfHoveredSubstring(substringClicked);
        let entitySelected = this.props.entities.find(e => e.entityName == obj.text)
        let allObjects = this.state.substringObjects;
        let isNewEntity = obj.text.toLowerCase() == 'new entity';

        if (substringClicked.entityId === null) {
            // let currentlyClickedSubstrings = this.state.substringsClicked;
            if (this.state.substringsClicked.length == 1) {
                let newClickedSubstringObject: SubstringObject = {
                    ...substringClicked,
                    entityName: entitySelected ? entitySelected.entityName : null,
                    entityId: entitySelected ? entitySelected.entityId : null,
                    dropdownStyle: styles.hidden,
                    labelStyle: styles.normal
                }
                allObjects[indexOfClickedSubstring] = newClickedSubstringObject;

                if (isNewEntity) {
                    this.setState({
                        newEntityIndex: substringClicked.startIndex,
                        newEntityText: substringClicked.text,
                        substringObjects: allObjects
                    })
                }
                else {
                    this.setState({
                        substringObjects: allObjects
                    })
                }
            } else if (this.state.substringsClicked.length > 1) {
                //1. set the entity and styling for the leftmost substring object 
                //2. remove all substring objects after the first one up to the second substring object 
                //3. set the state
                let left: SubstringObject = this.findLeftMostClickedSubstring();
                let right: SubstringObject = this.findRightMostClickedSubstring();
                allObjects = this.mergeSubstrings(left, right, entitySelected);
                if (isNewEntity) {
                    let newText = this.getFullStringBetweenSubstrings(left, right);
                    this.setState({
                        newEntityIndex: left.startIndex,
                        newEntityText: newText,
                        substringObjects: allObjects
                    })
                }
                else {
                    this.setState({
                        substringObjects: allObjects
                    })
                }
            }
            this.setState({
                substringsClicked: []
            })
        } else {
            if (obj.text.toLowerCase() == 'remove') {
                let newClickedSubstringObject: SubstringObject = {
                    ...substringClicked,
                    entityName: null,
                    entityId: null,
                    dropdownStyle: styles.hidden,
                    leftBracketStyle: styles.leftBracketDisplayedWhite,
                    rightBracketStyle: styles.rightBracketDisplayedWhite
                }
                allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
                this.setState({
                    substringObjects: allObjects
                })
            } else {
                let newClickedSubstringObject: SubstringObject = {
                    ...substringClicked,
                    entityName: entitySelected ? entitySelected.entityName : null,
                    entityId: entitySelected ? entitySelected.entityId : null,
                    dropdownStyle: styles.hidden
                }
                allObjects[indexOfClickedSubstring] = newClickedSubstringObject;
                this.setState({
                    substringObjects: allObjects
                })
            }
        }

        if (isNewEntity) {
            this.props.onNewEntitySelected();
        }
        else {
            this.updateCurrentPredictedEntities(allObjects, this.props.entities);
        }
    }
    getAlphabetizedEntityOptions(): BlisDropdownOption[] {
        let luisEntities = this.props.entities.filter(e => e.entityType == EntityType.LUIS.toString());
        let names: string[] = luisEntities.map(e => e.entityName)
        names.sort();
        return names.map<BlisDropdownOption>(name => {
            let ent = this.props.entities.find(e => e.entityName == name);
            return {
                key: ent.entityName,
                text: ent.entityName,
                style: "extractDropdown--normal"
            }
        })
    }
    includesPunctuation(text: string): boolean {
        if (text.includes(".") || text.includes("?") || text.includes("!") || text.includes(",") || text.includes(":") || text.includes(";")) {
            return true;
        } else {
            return false;
        }
    }
    parsePunctuationFromSubstrings(originals: SubstringObject[]): SubstringObject[] {
        let parsed: SubstringObject[] = [];
        originals.map((o: SubstringObject) => {
            if (this.includesPunctuation(o.text) && o.entityId == null && o.text.length !== 1) {
                //punctuation will always appear at the end of the word (exs- Hi, | What? | name?)
                //Note: If we ever want to handle quotes "X" ^ will not be true and we'll need to create 3 substring objects. For now, I'm assuming the quotes would be part of the string
                let substringObjForPunctuation: SubstringObject = {
                    text: o.text[o.text.length - 1],
                    entityName: null,
                    entityId: null,
                    rightBracketStyle: styles.rightBracketDisplayedWhite,
                    leftBracketStyle: styles.leftBracketDisplayedWhite,
                    //dropdown Style is going to have to depend on some state object. When you click an substring group with an entity it needs to go from styles.hidden to styles.normal
                    dropdownStyle: styles.hidden,
                    labelStyle: styles.hidden,
                    startIndex: o.startIndex + o.text.length - 1
                }
                parsed.push({ ...o, text: o.text.substring(0, o.text.length - 1) })
                parsed.push(substringObjForPunctuation)
            } else {
                parsed.push(o)
            }
        })
        return parsed;
    }
    renderSubstringObject(s: SubstringObject, key: number) {
        let allOptions = this.getAlphabetizedEntityOptions();
        let options = allOptions.filter(o => {
            // TODO: Entities are label entities, but here we depend on properties from PredictedEntity
            let found = this.state.predictedEntities.find(p => p.entityName == o.text) as PredictedEntity;
            if (found && (!found.metadata || found.metadata.isBucket == false)) {
                return false;
            }
            return true;
        })
        options.unshift({
            key: "Divider",
            text: "",
            itemType: DropdownMenuItemType.Divider,
            style: "extractDropdown--normal"
        })
        if (s.entityId !== null) {
            options.unshift({
                key: "Remove",
                text: "Remove",
                style: "extractDropdown--command"
            })
        }
        options.unshift({
            key: "New Entity",
            text: "New Entity",
            style: "extractDropdown--command"
        })
        if (s.text != " ") {
            if (s.text.length == 1 && this.includesPunctuation(s.text)) {
                return (
                    <div key={key} className="extractDiv" style={styles.containerDiv}>
                        <div style={styles.normal}>
                            <span className='ms-font-m' onClick={() => this.onClickText(s)} onMouseOver={() => this.onHoverText(s)} onMouseLeave={() => this.onUnhoverText(s)}>{s.text}</span>
                        </div>
                    </div>
                )
            }
            let dropdown = this.props.canEdit ?
                (<div style={s.dropdownStyle}>
                    <Dropdown
                        className='ms-font-m'
                        placeHolder="Select an Entity"
                        options={options}
                        onRenderOption={(option) => this.onRenderOption(option as BlisDropdownOption)}
                        selectedKey={null}
                        onChanged={(obj) => {
                            this.onDropdownEntitySelected(obj, s)
                        }}
                    />
                </div>
                )
                : null;
            return (
                <div key={key} className="extractDiv" style={styles.containerDiv}>
                    <span style={s.labelStyle} className='ms-font-xs'>{s.entityName}</span>
                    <div style={styles.normal}>
                        <span style={s.leftBracketStyle} className='ms-font-xl'>[</span>
                        <span className='ms-font-m' onClick={() => this.onClickText(s)} onMouseOver={() => this.onHoverText(s)} onMouseLeave={() => this.onUnhoverText(s)}>{s.text}</span>
                        <span style={s.rightBracketStyle} className='ms-font-xl'>]</span>
                    </div>
                    {dropdown}
                </div>
            )
        }

        return undefined
    }
    handleDeleteVariation() {
        let removedResponse = new ExtractResponse({ text: this.state.input, predictedEntities: [] });
        this.props.removeExtractResponse(removedResponse);
    }
    handleMousePosition(insideExtractor: boolean) {
        this.setState({
            insideExtractor: insideExtractor
        })
    }
    handleGlobalClick() {
        if (this.state.insideExtractor === false && this.state.substringsClicked.length > 0) {
            this.removeBracketsFromAllSelectedSubstrings();
            this.setState({
                substringsClicked: []
            })
        }
    }
    render() {
        let key = 0;
        let boxClass = this.props.isValid ? 'extractorResponseBox' : 'extractorResponseBox extractorResponseBoxInvalid';
        let button = this.props.isPrimary ? null :
            <div>
                <a onClick={() => this.handleDeleteVariation()}><span className="teachDeleteVariation ms-Icon ms-Icon--Delete"></span></a>
            </div>
        return (
            <div onClick={() => this.handleGlobalClick()} className='teachVariationBox'>
                {button}
                <div className='teachVariation'>
                    <div className={boxClass}>
                        <div onMouseLeave={() => this.handleMousePosition(false)} onMouseEnter={() => this.handleMousePosition(true)} className="extractContainer">
                            {this.state.substringObjects.map(s => this.renderSubstringObject(s, ++key))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        entities: state.entities
    }
}

export interface ReceivedProps {
    /**
     * Only operates on ExtractResponses.  TextVariations and LogExtactorSteps must be converted
     */
    extractResponse: ExtractResponse
    isPrimary: boolean
    isValid: boolean
    updateExtractResponse: (extractResponse: ExtractResponse) => void
    removeExtractResponse: (extractResponse: ExtractResponse) => void
    onNewEntitySelected: () => void
    canEdit: boolean
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(ExtractorResponseEditor);