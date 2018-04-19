/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
/**
 * This isn't really used, but is here to serve as a default for Slate value object.
 * In practice, it is immediately over written with a new value when the props of the component update based on application state
 * I think this is safer than assigning the value a null or an object that is not recognizable by Slate
 */
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
                                "text": "Default Value",
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