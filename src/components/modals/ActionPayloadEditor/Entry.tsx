import * as React from 'react'
import { EntityBase } from 'blis-models'

interface Props {
  mention: EntityBase
  theme: any
  searchValue: string
}

const customEntryComponent = (props: Props) => {
  const {
    mention,
    theme,
    searchValue,
    ...parentProps
  } = props

  const s = mention.entityName // mention.get('name')
  const entryText = s.substring(1, s.length-1)

  return (
    <div {...parentProps}>
      <span>E:</span> <span>{entryText}</span>
    </div>
  );
};

export default customEntryComponent