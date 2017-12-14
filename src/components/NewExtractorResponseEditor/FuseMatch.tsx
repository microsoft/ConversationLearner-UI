import * as React from 'react'
import { MatchedString } from './models'
import './FuseMatch.css'

interface Props {
    matches: MatchedString[]
}

export default function FuseMatch({ matches }: Props) {
    return <span>{matches.map((m, i) => <span className={`match-string ${m.matched ? 'match-string--matched' : ''}`} key={i}>{m.text}</span>)}</span>
}