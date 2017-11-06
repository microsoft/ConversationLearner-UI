import * as React from 'react'
// import { IMention } from './mentions'

interface Props {
  mention: any // Immutable.Map<IMention>
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

  const mentionDisplayName = mention.get('displayName')

  return (
    <div {...parentProps}>
      <span className={theme.mentionSuggestionsEntryText}>{mentionDisplayName}</span>
    </div>
  );
};

export default customEntryComponent