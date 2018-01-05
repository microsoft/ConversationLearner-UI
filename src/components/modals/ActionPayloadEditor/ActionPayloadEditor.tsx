import * as React from 'react'
import { EditorState } from 'draft-js'
import Editor from 'draft-js-plugins-editor'
import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin'
import CustomEntryComponent from './Entry'
// import CustomMention from './Mention'
import { IMention } from './mentions'
import { TipType } from '../../ToolTips'
import { mentionTrigger, getEntities } from './utilities'
import HelpIcon from '../../HelpIcon'
import * as OF from 'office-ui-fabric-react';
import './ActionPayloadEditor.css'
import 'draft-js/dist/Draft.css'
// import 'draft-js-mention-plugin/lib/plugin.css'

interface Props {
  allSuggestions: IMention[]
  editorState: EditorState
  placeholder: string
  disabled: boolean,
  label: string,
  tipType: TipType
  onChange: (editorState: EditorState) => void
}

interface State {
  suggestions: IMention[]
  isPayloadFocused: boolean
}

export default class extends React.Component<Props, State> {
  state = {
    suggestions: this.props.allSuggestions,
    isPayloadFocused: false,
  }

  private domEditor: any
  private mentionPlugin: any;

  constructor(p: Props) {
    super(p);
 
    // See: https://github.com/draft-js-plugins/draft-js-plugins/issues/298
    this.mentionPlugin = createMentionPlugin({
      entityMutability: 'IMMUTABLE',
      mentionPrefix: mentionTrigger,
      mentionTrigger,
      // mentionComponent: CustomMention
    })
  }

  setDomEditorRef = (ref: any) => this.domEditor = ref

  onChange = (editorState: EditorState) => {
    this.props.onChange(editorState)
  }

  onSearchChange = ({ value }: { value: string }) => {
    const entities = getEntities(this.props.editorState, `${mentionTrigger}mention`)
    const existingEntityIds = entities.map(e => e.entity.data.mention.id)
    const filteredMentions = this.props.allSuggestions.filter(m => !existingEntityIds.includes(m.id))
    this.setState({
      suggestions: defaultSuggestionsFilter(value, filteredMentions),
    })
  }

  onClickEditorContainer = () => {
    this.domEditor.focus()
  }

  onFocus = () => {
    this.setState({
      isPayloadFocused: true,
    })
  }

  onBlur = () => {
    this.setState({
      isPayloadFocused: false,
    })
  }

  render() {
    const { MentionSuggestions } = this.mentionPlugin;
    const plugins = [this.mentionPlugin];

    return (
      <div>
        <OF.Label>
          {this.props.label}
          <HelpIcon tipType={this.props.tipType} />
        </OF.Label>
        <div className={'editor' + (this.props.disabled ? ' editor--disabled' : '') + (this.state.isPayloadFocused ? ' editor--active' : '')} onClick={this.onClickEditorContainer}>
          <Editor
            placeholder={this.props.placeholder}
            editorState={this.props.editorState}
            onChange={this.onChange}
            plugins={plugins}
            ref={this.setDomEditorRef}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            readOnly={this.props.disabled}
          />
          <MentionSuggestions
            onSearchChange={this.onSearchChange}
            suggestions={this.state.suggestions}
            entryComponent={CustomEntryComponent}
          />
        </div>
      </div>
    )
  }
}