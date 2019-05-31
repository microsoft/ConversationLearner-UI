/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { MatchedString } from './models'
import './FuseMatch.css'

interface Props {
    matches: MatchedString[]
}

/**
 * Display Fuse.io search match with characters from search input having custom style such as highlight or bold
 */
export default function ({ matches }: Props) {
    return <span>{matches.map((m, i) => <span data-testid="fuse-match-option" className={`match-string${m.matched ? ' match-string--matched' : ''}`} key={i}>{m.text}</span>)}</span>
}