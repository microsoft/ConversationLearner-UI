import { NodeType } from './models'

const value = {
    "document": {
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
                                "text": "Test ",
                                "marks": [] as any[]
                            }
                        ]
                    },
                    {
                        "kind": "inline",
                        "type": NodeType.CustomEntityNodeType,
                        "isVoid": false,
                        "data": {
                            "foo": "bar"
                        },
                        "nodes": [
                            {
                                "kind": "text",
                                "leaves": [
                                    {
                                        "kind": "leaf",
                                        "text": "Hey",
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
                                "text": " Test",
                                "marks": [] as any[]
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

export default value