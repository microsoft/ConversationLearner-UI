/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import { TreeNode, TreeScorerStep } from '../components/modals/TreeView/TreeNodeLabel'

export class LogRankUtils {

    private entities: CLM.EntityBase[]
    private tree: TreeNode

    constructor(trainDialogs: CLM.TrainDialog[]) {
        this.tree = this.makeRoot()
        trainDialogs.forEach(td => this.addTrainDialog(this.tree, td))
    }

    makeRoot(): TreeNode {
        return { name: "start", attributes: undefined, children: [], trainDialogIds: []}
    }

    addExtractorStep(parentNode: TreeNode, extractorStep: CLM.TrainExtractorStep, roundIndex: number, trainDialog: CLM.TrainDialog): TreeNode {
        const child: TreeNode = {
            name: "User",
            userInput: extractorStep.textVariations.map(tv => { return {content: tv.text, trainDialogId: trainDialog.trainDialogId}}),
            attributes: undefined,
            children: [],
            trainDialogIds: [trainDialog.trainDialogId],
            roundIndex 
        }
        parentNode.children.push(child)
        return child
    }

    toTreeScorerStep(scorerStep: CLM.TrainScorerStep): TreeScorerStep {
        const entities: string[] = []
        if (scorerStep.input.filledEntities && scorerStep.input.filledEntities.length > 0) {
            scorerStep.input.filledEntities.forEach(fe => {
                let entity = this.entities.find(e => e.entityId === fe.entityId)
                if (entity) {
                    entities.push(entity.entityName)
                }
                else {
                    entities.push("UNKNOWN ENTITY")
                }
            })
        }
        return {
            actionId: scorerStep.labelAction || "UNKNOWN ACTION",
            memory: entities
        }
    }
    
    memoryAttributes(scorerStep: CLM.TrainScorerStep): { [key: string]: string; } | undefined {
        if (!scorerStep.input.filledEntities || scorerStep.input.filledEntities.length === 0) {
            return undefined
        }
        const attributes = {}
        scorerStep.input.filledEntities.forEach(fe => {
            let entity = this.entities.find(e => e.entityId === fe.entityId)
            if (entity) {
                // TODO: handle missing entity with warning?
                attributes[entity.entityName] = ""
            }
        })
        return attributes
    }

    addScorerStep(parentNode: TreeNode, scorerStep: CLM.TrainScorerStep, roundIndex: number, scoreIndex: number, trainDialog: CLM.TrainDialog): TreeNode {
        if (!scorerStep.labelAction) {
            return parentNode
        }

        if (!parentNode.scorerSteps) {
            parentNode.scorerSteps = []
        }
        parentNode.scorerSteps.push(this.toTreeScorerStep(scorerStep))
        return parentNode
    }

    addScorerSteps(parentNode: TreeNode, scorerSteps: CLM.TrainScorerStep[], roundIndex: number, trainDialog: CLM.TrainDialog): TreeNode {
        let parent = parentNode
        scorerSteps.forEach((scorerStep, scoreIndex) => {
            parent = this.addScorerStep(parent, scorerStep, roundIndex, scoreIndex, trainDialog)
        })
        return parent
    }

    doesRoundMatch(round1: TreeNode, round2: TreeNode): boolean {

        // Check scorer steps array
        if (round1.scorerSteps && !round2.scorerSteps ||
            !round1.scorerSteps && round2.scorerSteps) {
                return false
            }
        else if (!round1.scorerSteps && !round2.scorerSteps) {
            return true
        }
        else {
            return JSON.stringify(round1.scorerSteps) === JSON.stringify(round2.scorerSteps)
        }
    }

    findMatchingRound(parent: TreeNode, round: CLM.TrainRound, roundIndex: number, trainDialog: CLM.TrainDialog, testOnly: boolean): TreeNode | null {

        // Create new round
        const tempParent: TreeNode = this.makeRoot()
        const child = this.addRound(tempParent, round, roundIndex, trainDialog)
        const newRound = tempParent.children[0]

        // Check for existing matching round
        const match = parent.children.find(r => {
            // Maching round
            return this.doesRoundMatch(r, newRound)
        })

        // If a match, return last scorer step as parent
        if (match) { 
            match.userInput = [...match.userInput, ...newRound.userInput]
            match.trainDialogIds = [...match.trainDialogIds, ...newRound.trainDialogIds]
            match.allowForeignObjects = true
            return match
        }

        if (testOnly) {
            return null
        }

        // Otherwise add as new child
        parent.children.push(tempParent.children[0])
        return child
    }

    addRound(parentNode: TreeNode, round: CLM.TrainRound, roundIndex: number, trainDialog: CLM.TrainDialog): TreeNode {
        let parent = parentNode
        parent = this.addExtractorStep(parent, round.extractorStep, roundIndex, trainDialog)
        parent = this.addScorerSteps(parent, round.scorerSteps, roundIndex, trainDialog)
        return parent
    }

    addTrainDialog(tree: TreeNode, trainDialog: CLM.TrainDialog): void {
        let parent: TreeNode | null = tree
        for (let [roundIndex, round] of trainDialog.rounds.entries()) {
            parent = this.findMatchingRound(parent, round, roundIndex, trainDialog, false)    
            if (!parent) {
                return
            }
        }
    }

    isInTree(trainDialog: CLM.TrainDialog): boolean {
        let parent: TreeNode | null = this.tree
        for (let [roundIndex, round] of trainDialog.rounds.entries()) {
            parent = this.findMatchingRound(parent, round, roundIndex, trainDialog, true)    
            if (!parent) {
                return false
            }
        }
        return true
    }
}