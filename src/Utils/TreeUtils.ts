/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import { TreeNode, TreeScorerStep } from '../components/modals/TreeView/TreeNodeLabel'

export class TreeUtils {

    private entities: CLM.EntityBase[]
    private tree: TreeNode

    // Funtion that just returns a completed tree.  This is handy
    // when the other functions of TreeUtils aren't needed
    static MakeTree(dialogs: CLM.TrainDialog[] | CLM.LogDialog[], entities: CLM.EntityBase[]): TreeNode {
        const treeUtils = new TreeUtils(dialogs, entities)
        return treeUtils.tree
    }

    // Create a tree from the given set of train or log dialogs
    constructor(dialogs: CLM.TrainDialog[] | CLM.LogDialog[], entities: CLM.EntityBase[]) {
        this.entities = entities
        this.tree = this.makeRoot()

        let trainDialogs: CLM.TrainDialog[]
        if (dialogs[0] && (dialogs[0] as CLM.LogDialog).logDialogId) {
            // Convert LogDialogs to TrainDialogs
            const logDialogs = dialogs as CLM.LogDialog[]
            trainDialogs = logDialogs.map(ld =>
                CLM.ModelUtils.ToTrainDialog(ld))
        }
        else {
            trainDialogs = dialogs as CLM.TrainDialog[]
        }
        trainDialogs.forEach(td => this.addTrainDialog(this.tree, td))
    }

    // Return true if given TrainDialog is in the tree
    isInTree(trainDialog: CLM.TrainDialog): boolean {
        if (!this.tree) {
            throw new Error("Tree has not been created")
        }
        let parent: TreeNode | null = this.tree
        for (let [roundIndex, round] of trainDialog.rounds.entries()) {
            parent = this.findMatchingRound(parent, round, roundIndex, trainDialog, true)
            if (!parent) {
                return false
            }
        }
        return true
    }

    // Return leaf nodes for tree
    getLeaves(treeNode?: TreeNode): TreeNode[] {
        if (!this.tree) {
            throw new Error("Tree has not been created")
        }
        const curNode = treeNode || this.tree
        let leaves: TreeNode[] = []
        if (curNode.children.length === 0) {
            return [curNode]
        }
        curNode.children.forEach(tn =>
            leaves = [...leaves, ...this.getLeaves(tn)]
        )
        return leaves
    }

    // Return list of ActionIds for leaf nodes
    getLeafActionIds(): string[] {
        const trainLeaves = this.getLeaves()
        return trainLeaves
            .filter(l => l.scorerSteps
                && l.scorerSteps.length > 0
                && l.scorerSteps[l.scorerSteps.length - 1].actionId)
            .map(l => l.scorerSteps![l.scorerSteps!.length - 1].actionId!)

    }

    private makeRoot(): TreeNode {
        return {
            name: "start",
            attributes: undefined,
            children: [],
            trainDialogIds: [],
            sourceLogDialogIds: []
        }
    }

    private addExtractorStep(parentNode: TreeNode, extractorStep: CLM.TrainExtractorStep, roundIndex: number, trainDialog: CLM.TrainDialog): TreeNode {
        const child: TreeNode = {
            name: "User",
            userInput: extractorStep.textVariations.map(tv => { return { content: tv.text, trainDialogId: trainDialog.trainDialogId } }),
            attributes: undefined,
            children: [],
            trainDialogIds: trainDialog.trainDialogId ? [trainDialog.trainDialogId] : [],
            sourceLogDialogIds: trainDialog.sourceLogDialogId ? [trainDialog.sourceLogDialogId] : [],
            roundIndex
        }
        parentNode.children.push(child)
        return child
    }

    private toTreeScorerStep(scorerStep: CLM.TrainScorerStep): TreeScorerStep {
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

    private addScorerStep(parentNode: TreeNode, scorerStep: CLM.TrainScorerStep, roundIndex: number, scoreIndex: number, trainDialog: CLM.TrainDialog): TreeNode {
        if (!scorerStep.labelAction) {
            return parentNode
        }

        if (!parentNode.scorerSteps) {
            parentNode.scorerSteps = []
        }
        parentNode.scorerSteps.push(this.toTreeScorerStep(scorerStep))
        return parentNode
    }

    private addScorerSteps(parentNode: TreeNode, scorerSteps: CLM.TrainScorerStep[], roundIndex: number, trainDialog: CLM.TrainDialog): TreeNode {
        let parent = parentNode
        scorerSteps.forEach((scorerStep, scoreIndex) => {
            parent = this.addScorerStep(parent, scorerStep, roundIndex, scoreIndex, trainDialog)
        })
        return parent
    }

    private doesRoundMatch(round1: TreeNode, round2: TreeNode): boolean {

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

    private findMatchingRound(parent: TreeNode, round: CLM.TrainRound, roundIndex: number, trainDialog: CLM.TrainDialog, testOnly: boolean): TreeNode | null {

        // Create new round.  Will throw away if find a match, or add if no match found
        const newParent: TreeNode = this.makeRoot()
        const child = this.addRound(newParent, round, roundIndex, trainDialog)
        const newRound = newParent.children[0]

        // Check for existing matching round
        const match = parent.children.find(r => {
            // Maching round
            return this.doesRoundMatch(r, newRound)
        })

        // If a match, return last scorer step as parent
        if (match) {
            match.userInput = [...match.userInput, ...newRound.userInput]
            match.trainDialogIds = [...match.trainDialogIds, ...newRound.trainDialogIds]
            match.sourceLogDialogIds = [...match.sourceLogDialogIds, ...newRound.sourceLogDialogIds]
            match.allowForeignObjects = true
            return match
        }

        if (testOnly) {
            return null
        }

        // Otherwise add as new child
        parent.children.push(newParent.children[0])
        return child
    }

    private addRound(parentNode: TreeNode, round: CLM.TrainRound, roundIndex: number, trainDialog: CLM.TrainDialog): TreeNode {
        let parent = parentNode
        parent = this.addExtractorStep(parent, round.extractorStep, roundIndex, trainDialog)
        parent = this.addScorerSteps(parent, round.scorerSteps, roundIndex, trainDialog)
        return parent
    }

    private addTrainDialog(tree: TreeNode, trainDialog: CLM.TrainDialog): void {
        let parent: TreeNode | null = tree
        for (let [roundIndex, round] of trainDialog.rounds.entries()) {
            parent = this.findMatchingRound(parent, round, roundIndex, trainDialog, false)
            if (!parent) {
                return
            }
        }
    }
}