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
})