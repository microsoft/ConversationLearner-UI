import * as React from 'react'
import { EditorState } from 'draft-js'
import Editor from 'draft-js-plugins-editor'
import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin'
import { EntityBase } from 'blis-models'
import CustomEntryComponent from './Entry'
import CustomMention from './Mention'
import './ActionPayloadEditor.css'
import 'draft-js/dist/Draft.css'
// import 'draft-js-mention-plugin/lib/plugin.css'

interface Props {
  editorState: EditorState
  placeholder: string
  onChange: (editorState: EditorState) => void
  allSuggestions: EntityBase[]
}

interface State {
  suggestions: EntityBase[]
}

const mentionTrigger = '['

const getEntities = (editorState: EditorState, entityType: string | null = null): any[] => {
  const content = editorState.getCurrentContent();
  const entities: any = [];
  content.getBlocksAsArray().forEach((block) => {
    let selectedEntity: any = null;
    block.findEntityRanges(
      (character) => {
        if (character.getEntity() !== null) {
          const entity = content.getEntity(character.getEntity());
          if (!entityType || (entityType && entity.getType() === entityType)) {
            const entityMap = content.getEntity(character.getEntity())
            const entityJs = (entityMap as any).toJS()
            const mention = entityJs.data.mention.toJS()
            const entityRaw = {
              type: entityJs.type,
              mutability: entityJs.mutability,
              data: {
                mention
              }
            }

            selectedEntity = {
              entityKey: character.getEntity(),
              blockKey: block.getKey(),
              entity: entityRaw
            };
            return true;
          }
        }
        return false;
      },
      (start, end) => {
        entities.push({ ...selectedEntity, start, end });
      });
  });
  return entities;
};

export default class extends React.Component<Props, State> {
  domEditor: any
  mentionPlugin: any

  state = {
    suggestions: this.props.allSuggestions
  }

  constructor(props: Props) {
    super(props);

    this.mentionPlugin = createMentionPlugin({
      entityMutability: 'IMMUTABLE',
      mentionPrefix: '',
      mentionTrigger,
      mentionComponent: CustomMention
    });
  }

  setDomEditorRef = (ref: any) => this.domEditor = ref

  onChange = (editorState: EditorState) => {
    this.props.onChange(editorState)
  }

  onSearchChange = ({ value }: { value: string }) => {
    console.log(`onSearchChange: ${value}`)
    const entities = getEntities(this.props.editorState, `${mentionTrigger}mention`)
    const existingEntityIds = entities.map(e => e.entity.data.mention.id)
    const filteredMentions = this.props.allSuggestions.filter(e => !existingEntityIds.includes(e.entityId))
    this.setState({
      suggestions: defaultSuggestionsFilter(value, filteredMentions),
    })
  }

  onClickEditorContainer = () => {
    this.domEditor.focus()
  }

  render() {
    const { MentionSuggestions } = this.mentionPlugin
    const plugins = [this.mentionPlugin]

    return (
      <div className="editor" onClick={this.onClickEditorContainer}>
        <Editor
          placeholder={this.props.placeholder}
          editorState={this.props.editorState}
          onChange={this.onChange}
          plugins={plugins}
          ref={this.setDomEditorRef}
        />
        <MentionSuggestions
          onSearchChange={this.onSearchChange}
          suggestions={this.state.suggestions}
          entryComponent={CustomEntryComponent}
        />
      </div>
    )
  }
}