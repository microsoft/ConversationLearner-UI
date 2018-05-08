/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { NodeTypes } from './models'
import Plain from 'slate-plain-serializer'
import EntityIdSerializer from './slateSerializer'

describe('EntityIdSerializer', () => {
    const emptyMap = new Map<string, string>()
    test('given slate value with no custom inline nodes, should serialize the same way as Plain serializer', () => {
        const testValue = Plain.deserialize('Some simple slate value with 1 block containing 1 text node')

        const plainString = Plain.serialize(testValue)
        const entityIdString = EntityIdSerializer.serialize(testValue, emptyMap)

        expect(entityIdString).toEqual(plainString)
    })

    test('given slate value with incomplete inline nodes, should serialize the same way as Plain serializer', () => {
        const testValue = Plain.deserialize('').change()
            .insertText('some text to start ')
            .insertInline({
                type: NodeTypes.Mention,
                data: {
                    completed: false
                },
                nodes: [
                    {
                        kind: 'text',
                        leaves: [
                            {
                                text: '$entityName'
                            }
                        ]
                    }
                ]
            })
            .value

        const plainString = Plain.serialize(testValue)
        const entityIdString = EntityIdSerializer.serialize(testValue, emptyMap)

        expect(entityIdString).toEqual(plainString)
    })

    test('given slate value which has required inline node and fallback of false that doesnt have matching option, throw error', () => {
        const testValue = Plain.deserialize('').change()
            .insertText('some text to start ')
            .insertInline({
                type: NodeTypes.Mention,
                data: {
                    completed: true
                },
                nodes: [
                    {
                        kind: 'text',
                        leaves: [
                            {
                                text: '$entityName'
                            }
                        ]
                    }
                ]
            })
            .value

        const action = () => EntityIdSerializer.serialize(testValue, emptyMap)
        expect(action).toThrow()
    })

    test('given slate value which has required inline node and fallback of false that does have matching option replace value', () => {
        const entityId = '73b8318e-1375-402e-ab4e-6137c6ce163b'
        const testValue = Plain.deserialize('').change()
            .insertText('some text to start ')
            .insertInline({
                type: NodeTypes.Mention,
                data: {
                    completed: true,
                    option: {
                        id: entityId,
                        name: 'entityName'
                    }
                },
                nodes: [
                    {
                        kind: 'text',
                        leaves: [
                            {
                                text: '$entityName'
                            }
                        ]
                    }
                ]
            })
            .value

        const value = EntityIdSerializer.serialize(testValue, new Map<string, string>([
            [entityId, 'SOME_VALUE']
        ]))
        expect(value).toEqual('some text to start SOME_VALUE')
    })

    test('given slate value which has required inline node and fallback of true that does not matching entity should mimic Plain serializer and use text value', () => {
        const entityId = '73b8318e-1375-402e-ab4e-6137c6ce163b'
        const testValue = Plain.deserialize('').change()
            .insertText('some text to start ')
            .insertInline({
                type: NodeTypes.Mention,
                data: {
                    completed: true,
                    option: {
                        id: entityId,
                        name: 'entityName'
                    }
                },
                nodes: [
                    {
                        kind: 'text',
                        leaves: [
                            {
                                text: '$entityName'
                            }
                        ]
                    }
                ]
            })
            .collapseToStartOfNextText()
            .insertText(' some other text')
            .value

        const plainString = Plain.serialize(testValue)
        const entityIdString = EntityIdSerializer.serialize(testValue, emptyMap, true)

        expect(plainString).toEqual(`some text to start $entityName some other text`)
        expect(entityIdString).toEqual(`some text to start $entityName some other text`)
    })

    describe('optional entities', () => {
        const entities = [
            {
                id: 'entityId1',
                name: 'entityName1'
            },
            {
                id: 'entityId2',
                name: 'entityName2'
            }
        ]

        const testValue = Plain.deserialize('').change()
            .insertText('some text to start ')
            .insertInline({
                type: NodeTypes.Mention,
                data: {
                    completed: true,
                    option: entities[0]
                },
                nodes: [
                    {
                        kind: 'text',
                        leaves: [
                            {
                                text: '$entityName1'
                            }
                        ]
                    }
                ]
            })
            .collapseToStartOfNextText()
            .insertText(' some other text ')
            .insertInline({
                type: NodeTypes.Optional,
                nodes: [
                    {
                        kind: 'text',
                        leaves: [
                            {
                                text: '[some stuff '
                            }
                        ]
                    }
                ]
            })
            .insertInline({
                type: NodeTypes.Mention,
                data: {
                    completed: true,
                    option: entities[1]
                },
                nodes: [
                    {
                        kind: 'text',
                        leaves: [
                            {
                                text: '$entityName2'
                            }
                        ]
                    }
                ]
            })
            .collapseToStartOfNextText()
            .insertText(' ending optional node ]')
            .collapseToStartOfNextText()
            .insertText('ending text')
            .value

        const plainString = Plain.serialize(testValue)
        const entityIdString = EntityIdSerializer.serialize(testValue, new Map<string, string>([
            [entities[0].id, 'Custom Entity 1 Value'],
            [entities[1].id, 'Custom Entity 2 Value']
        ]))
        const partialString = EntityIdSerializer.serialize(testValue, new Map<string, string>([
            [entities[0].id, 'Custom Entity 1 Value']
        ]))

        test(`given slate value with custom optional inline nodes without matching value in map are removed`, () => {
            expect(plainString).toEqual(`some text to start $entityName1 some other text [some stuff $entityName2 ending optional node ]ending text`)
            expect(partialString).toEqual(`some text to start Custom Entity 1 Value some other text ending text`)
        })
        
        test('given slate value with custom optional inline nodes with matching value in map are preserved', () => {
            expect(entityIdString).toEqual(`some text to start Custom Entity 1 Value some other text some stuff Custom Entity 2 Value ending optional node ending text`)
        })
    })
})
