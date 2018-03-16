import { IOption, NodeTypes } from "./models"

/**
 * Recursively walk up DOM tree until root or parent with non-static position is found.
 * (relative, fixed, or absolute) which will be used as reference for absolutely positioned elements within it
 */
export const getRelativeParent = (element: HTMLElement | null): HTMLElement => {
    if (!element) {
        return document.body
    }

    const position = window.getComputedStyle(element).getPropertyValue('position')
    if (position !== 'static') {
        return element
    }

    return getRelativeParent(element.parentElement)
};

export const valueToJSON = (value: any) => {
    const characters = value.characters ? value.characters.toJSON() : [];
    return {
        data: value.data.toJSON(),
        decorations: value.decorations ? value.decorations.toJSON() : [],
        document: value.toJSON().document,
        activeMarks: value.activeMarks.toJSON(),
        marks: value.marks.toJSON(),
        texts: value.texts.toJSON(),
        characters,
        selectedText: characters.reduce((s: string, node: any) => s += node.text, ''),
        selection: value.selection.toJSON()
    }
}


export const findNodeByPath = (path: number[], root: any, nodeType: string = NodeTypes.Mention): any => {
    if (path.length === 0) {
        return null
    }

    const [nextKey, ...nextPath] = path

    const nextRoot = root.findDescendant((node: any, i: number) => i === nextKey)
    // If the node was already removed due to another change it might not exist in the path anymore
    if (nextRoot === null) {
        return null
    }

    if (nextRoot.type === nodeType) {
        return nextRoot
    }

    return findNodeByPath(nextPath, nextRoot)
}

export const getNodesByPath = (path: number[], root: any, nodes: any[] = []): any[] => {
    if (path.length === 0) {
        return nodes
    }

    const [nextKey, ...nextPath] = path
    const nextRoot = root.findDescendant((node: any, i: number) => i === nextKey)

    // If the node was already removed due to another change it might not exist in the path anymore
    if (nextRoot === null) {
        return nodes
    }

    nodes.push(nextRoot)

    return getNodesByPath(nextPath, nextRoot, nodes)
}

export const getEntitiesFromValue = (value: any): IOption[] => {
    const tree = value.toJSON().document

    return depthFirstSearch(tree, n => n.type === NodeTypes.Mention && n.data.completed === true, n => n.type === NodeTypes.Optional)
        .map<IOption>(n => n.data.option)
}

interface INode {
    kind: string
    type: string
    nodes: INode[] | undefined
    data: any
}

/**
 * This a normal tree DFS with change that it only returns nodes that satisfy the predicate and also it will skip nodes that are excluded
 * In practice this means return all inline nodes and skip optional nodes effectively returning list of inline nodes that are not within and optional node.
 */
const depthFirstSearch = (root: INode, predicate: (n: INode) => boolean, exclude: (n: INode) => boolean, nodes: INode[] = []): INode[] => {
    if (predicate(root)) {
        nodes.push(root)
    }

    const childNodes = !Array.isArray(root.nodes)
        ? []
        : root.nodes
            .filter(n => !exclude(n))
            .map(n => depthFirstSearch(n, predicate, exclude))
            .reduce((a, b) => [...a, ...b], [])

    return [...nodes, ...childNodes]
}
