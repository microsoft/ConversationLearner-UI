/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IOption } from './APEModels'
import SlateTransformer from './slateTransformer'

const testJsonValueIncomplete = {
    "kind": "value",
    "document": {
        "kind": "document",
        "data": {},
        "nodes": [
            {
                "kind": "block",
                "type": "paragraph",
                "isVoid": false,
                "data": {},
                "nodes": [
                    {
                        "kind": "text",
                        "leaves": [
                            {
                                "kind": "leaf",
                                "text": "This is ",
                                "marks": [] as any[]
                            }
                        ]
                    },
                    {
                        "kind": "inline",
                        "type": "mention-inline-node",
                        "isVoid": false,
                        "data": {
                            "completed": false
                        },
                        "nodes": [
                            {
                                "kind": "text",
                                "leaves": [
                                    {
                                        "kind": "leaf",
                                        "text": "$otherSpecial",
                                        "marks": [] as any[]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "kind": "text",
                        "leaves": [
                            {
                                "kind": "leaf",
                                "text": "",
                                "marks": []
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

const testJsonValue = {
    "kind": "value",
    "document": {
        "kind": "document",
        "data": {},
        "nodes": [
            {
                "kind": "block",
                "type": "paragraph",
                "isVoid": false,
                "data": {},
                "nodes": [
                    {
                        "kind": "text",
                        "leaves": [
                            {
                                "kind": "leaf",
                                "text": "This is ",
                                "marks": [] as any[]
                            }
                        ]
                    },
                    {
                        "kind": "inline",
                        "type": "mention-inline-node",
                        "isVoid": false,
                        "data": {
                            "completed": true,
                            "option": {
                                "id": "bc83bea8-245c-43ed-bd63-b264280d5aff",
                                "name": "special"
                            }
                        },
                        "nodes": [
                            {
                                "kind": "text",
                                "leaves": [
                                    {
                                        "kind": "leaf",
                                        "text": "$special",
                                        "marks": [] as any[]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "kind": "text",
                        "leaves": [
                            {
                                "kind": "leaf",
                                "text": " and another ",
                                "marks": []
                            }
                        ]
                    },
                    {
                        "kind": "inline",
                        "type": "mention-inline-node",
                        "isVoid": false,
                        "data": {
                            "completed": true,
                            "option": {
                                "id": "f12bba59-e82e-4046-a7dd-90a66c621e04",
                                "name": "otherSpecial"
                            }
                        },
                        "nodes": [
                            {
                                "kind": "text",
                                "leaves": [
                                    {
                                        "kind": "leaf",
                                        "text": "$otherSpecial",
                                        "marks": []
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "kind": "text",
                        "leaves": [
                            {
                                "kind": "leaf",
                                "text": "",
                                "marks": []
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

const expectedJsonValue = {
    "kind": "value",
    "document": {
        "kind": "document",
        "data": {},
        "nodes": [
            {
                "kind": "block",
                "type": "paragraph",
                "isVoid": false,
                "data": {},
                "nodes": [
                    {
                        "kind": "text",
                        "leaves": [
                            {
                                "kind": "leaf",
                                "text": "This is ",
                                "marks": [] as any[]
                            }
                        ]
                    },
                    {
                        "kind": "inline",
                        "type": "mention-inline-node",
                        "isVoid": false,
                        "data": {
                            "completed": true,
                            "option": {
                                "id": "bc83bea8-245c-43ed-bd63-b264280d5aff",
                                "name": "specialEDITED"
                            }
                        },
                        "nodes": [
                            {
                                "kind": "text",
                                "leaves": [
                                    {
                                        "kind": "leaf",
                                        "text": "$specialEDITED",
                                        "marks": [] as any[]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "kind": "text",
                        "leaves": [
                            {
                                "kind": "leaf",
                                "text": " and another ",
                                "marks": []
                            }
                        ]
                    },
                    {
                        "kind": "inline",
                        "type": "mention-inline-node",
                        "isVoid": false,
                        "data": {
                            "completed": true,
                            "option": {
                                "id": "f12bba59-e82e-4046-a7dd-90a66c621e04",
                                "name": "otherSpecial"
                            }
                        },
                        "nodes": [
                            {
                                "kind": "text",
                                "leaves": [
                                    {
                                        "kind": "leaf",
                                        "text": "$otherSpecial",
                                        "marks": []
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "kind": "text",
                        "leaves": [
                            {
                                "kind": "leaf",
                                "text": "",
                                "marks": []
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

const slateValueOriginal = {
    "kind": "value",
    "document": {
        "kind": "document",
        "data": {},
        "nodes": [
            {
                "kind": "block",
                "type": "line",
                "isVoid": false,
                "data": {},
                "nodes": [
                    {
                        "kind": "text",
                        "leaves": [
                            {
                                "kind": "leaf",
                                "text": "The quick ",
                                "marks": []
                            }
                        ]
                    },
                    {
                        "kind": "inline",
                        "type": "mention-inline-node",
                        "isVoid": false,
                        "data": {
                            "completed": true,
                            "option": {
                                "id": "1e37c59a-2af7-41df-b4d0-729e6974f1a6",
                                "name": "myEntity"
                            }
                        },
                        "nodes": [
                            {
                                "kind": "text",
                                "leaves": [
                                    {
                                        "kind": "leaf",
                                        "text": "$myEntity",
                                        "marks": []
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "kind": "text",
                        "leaves": [
                            {
                                "kind": "leaf",
                                "text": " fox jumped over the ",
                                "marks": []
                            }
                        ]
                    },
                    {
                        "kind": "inline",
                        "type": "optional-inline-node",
                        "isVoid": false,
                        "data": {},
                        "nodes": [
                            {
                                "kind": "text",
                                "leaves": [
                                    {
                                        "kind": "leaf",
                                        "text": "[lazy ",
                                        "marks": []
                                    }
                                ]
                            },
                            {
                                "kind": "inline",
                                "type": "mention-inline-node",
                                "isVoid": false,
                                "data": {
                                    "completed": true,
                                    "option": {
                                        "id": "e45b781a-4366-4400-a611-3ebb08868039",
                                        "name": "otherEntity"
                                    }
                                },
                                "nodes": [
                                    {
                                        "kind": "text",
                                        "leaves": [
                                            {
                                                "kind": "leaf",
                                                "text": "$otherEntity",
                                                "marks": []
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "kind": "text",
                                "leaves": [
                                    {
                                        "kind": "leaf",
                                        "text": "]",
                                        "marks": []
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "kind": "text",
                        "leaves": [
                            {
                                "kind": "leaf",
                                "text": "",
                                "marks": []
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

const slateValueWithReplace = {
    "kind": "value",
    "document": {
        "kind": "document",
        "data": {},
        "nodes": [
            {
                "kind": "block",
                "type": "line",
                "isVoid": false,
                "data": {},
                "nodes": [
                    {
                        "kind": "text",
                        "leaves": [
                            {
                                "kind": "leaf",
                                "text": "The quick ",
                                "marks": []
                            }
                        ]
                    },
                    {
                        "kind": "inline",
                        "type": "mention-inline-node",
                        "isVoid": false,
                        "data": {
                            "completed": true,
                            "filled": true,
                            "option": {
                                "id": "1e37c59a-2af7-41df-b4d0-729e6974f1a6",
                                "name": "myEntity"
                            }
                        },
                        "nodes": [
                            {
                                "kind": "text",
                                "leaves": [
                                    {
                                        "kind": "leaf",
                                        "text": "Replacer was here myEntity aValue",
                                        "marks": []
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "kind": "text",
                        "leaves": [
                            {
                                "kind": "leaf",
                                "text": " fox jumped over the ",
                                "marks": []
                            }
                        ]
                    },
                    {
                        "kind": "inline",
                        "type": "optional-inline-node",
                        "isVoid": false,
                        "data": {},
                        "nodes": [
                            {
                                "kind": "text",
                                "leaves": [
                                    {
                                        "kind": "leaf",
                                        "text": "[lazy ",
                                        "marks": []
                                    }
                                ]
                            },
                            {
                                "kind": "inline",
                                "type": "mention-inline-node",
                                "isVoid": false,
                                "data": {
                                    "completed": true,
                                    "filled": true,
                                    "option": {
                                        "id": "e45b781a-4366-4400-a611-3ebb08868039",
                                        "name": "otherEntity"
                                    }
                                },
                                "nodes": [
                                    {
                                        "kind": "text",
                                        "leaves": [
                                            {
                                                "kind": "leaf",
                                                "text": "Replacer was here otherEntity someValue",
                                                "marks": []
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "kind": "text",
                                "leaves": [
                                    {
                                        "kind": "leaf",
                                        "text": "]",
                                        "marks": []
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "kind": "text",
                        "leaves": [
                            {
                                "kind": "leaf",
                                "text": "",
                                "marks": []
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

const slateValueWithEntitiesNotRequired = {
    "kind": "value",
    "document": {
        "kind": "document",
        "data": {},
        "nodes": [
            {
                "kind": "block",
                "type": "line",
                "isVoid": false,
                "data": {},
                "nodes": [
                    {
                        "kind": "text",
                        "leaves": [
                            {
                                "kind": "leaf",
                                "text": "The quick ",
                                "marks": []
                            }
                        ]
                    },
                    {
                        "kind": "inline",
                        "type": "mention-inline-node",
                        "isVoid": false,
                        "data": {
                            "completed": true,
                            "missing": true,
                            "required": true,
                            "option": {
                                "id": "1e37c59a-2af7-41df-b4d0-729e6974f1a6",
                                "name": "myEntity"
                            }
                        },
                        "nodes": [
                            {
                                "kind": "text",
                                "leaves": [
                                    {
                                        "kind": "leaf",
                                        "text": "Replacer was here myEntity",
                                        "marks": []
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "kind": "text",
                        "leaves": [
                            {
                                "kind": "leaf",
                                "text": " fox jumped over the ",
                                "marks": []
                            }
                        ]
                    },
                    {
                        "kind": "inline",
                        "type": "optional-inline-node",
                        "isVoid": false,
                        "data": {},
                        "nodes": [
                            {
                                "kind": "text",
                                "leaves": [
                                    {
                                        "kind": "leaf",
                                        "text": "[lazy ",
                                        "marks": []
                                    }
                                ]
                            },
                            {
                                "kind": "inline",
                                "type": "mention-inline-node",
                                "isVoid": false,
                                "data": {
                                    "completed": true,
                                    "missing": true,
                                    "option": {
                                        "id": "e45b781a-4366-4400-a611-3ebb08868039",
                                        "name": "otherEntity"
                                    }
                                },
                                "nodes": [
                                    {
                                        "kind": "text",
                                        "leaves": [
                                            {
                                                "kind": "leaf",
                                                "text": "Replacer was here otherEntity",
                                                "marks": []
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "kind": "text",
                                "leaves": [
                                    {
                                        "kind": "leaf",
                                        "text": "]",
                                        "marks": []
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "kind": "text",
                        "leaves": [
                            {
                                "kind": "leaf",
                                "text": "",
                                "marks": []
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

describe('SlateTransformer', () => {
    describe('updateOptionNames', () => {
        test('given slate value which has incomplete inline node option return the node unmodified', () => {
            const newJsonValue = SlateTransformer.updateOptionNames(testJsonValueIncomplete, [])
            expect(newJsonValue).toEqual(testJsonValueIncomplete)
        })

        test('given slate value which has inline node option that doesnt have matching option, throw error', () => {
            const action = () => SlateTransformer.updateOptionNames(testJsonValue, [])
            expect(action).toThrow()
        })

        test('given slate value json and no new names return copy of object that is equivalent', () => {
            const newOptions: IOption[] = [
                {
                    id: 'bc83bea8-245c-43ed-bd63-b264280d5aff',
                    name: 'specialEDITED'
                },
                {
                    id: "f12bba59-e82e-4046-a7dd-90a66c621e04",
                    name: "otherSpecial"
                }
            ]

            const newJsonValue = SlateTransformer.updateOptionNames(testJsonValue, newOptions) as typeof testJsonValue
            expect(newJsonValue).toEqual(expectedJsonValue)
        })
    })

    describe('replaceEntityNodesWithValues', () => {
        test('given slate object with no values to replace return unmodified object', () => {
            // Arrange
            const testData = {
                slateValue: JSON.parse(JSON.stringify(slateValueOriginal)),
                expectedValue: JSON.parse(JSON.stringify(slateValueOriginal))
            }

            // Act
            const actualValue = SlateTransformer.replaceEntityNodesWithValues(testData.slateValue, {}, e => 'replacer was here', false)

            // Assert
            expect(actualValue).toEqual(testData.expectedValue)
        })

        test('given slate object and values, return slate object with replaced values', () => {
            // Arrange
            const testData = {
                slateValue: JSON.parse(JSON.stringify(slateValueOriginal)),
                expectedValue: JSON.parse(JSON.stringify(slateValueWithReplace)),
                entityMap: {
                    '1e37c59a-2af7-41df-b4d0-729e6974f1a6': {
                        name: 'myEntity',
                        value: 'aValue',
                    },
                    'e45b781a-4366-4400-a611-3ebb08868039': {
                        name: 'otherEntity',
                        value: 'someValue',
                    }
                }
            }

            // Act
            const actualValue = SlateTransformer.replaceEntityNodesWithValues(testData.slateValue, testData.entityMap, e => `Replacer was here ${e.name} ${e.value}`, false)

            // Assert
            expect(actualValue).toEqual(testData.expectedValue)
        })

        test('given slate object with map missing values mark entity as missing and required based on entityRequired flag', () => {
            // Arrange
            const testData = {
                slateValue: JSON.parse(JSON.stringify(slateValueOriginal)),
                expectedValue: JSON.parse(JSON.stringify(slateValueWithEntitiesNotRequired)),
                entityMap: {
                    '1e37c59a-2af7-41df-b4d0-729e6974f1a6': {
                        name: 'myEntity',
                    },
                    'e45b781a-4366-4400-a611-3ebb08868039': {
                        name: 'otherEntity',
                    }
                }
            }

            // Act
            const actualValue = SlateTransformer.replaceEntityNodesWithValues(testData.slateValue, testData.entityMap, e => `Replacer was here ${e.name}`, true)

            // Assert
            expect(actualValue).toEqual(testData.expectedValue)
        })
    })
})