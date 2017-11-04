import { EditorState } from 'draft-js'
import { IMention } from './mentions'

export interface IRawEntityData {
  mention: IMention
}

export interface IRawEntity {
  type: string
  mutability: string
  data: IRawEntityData
}

export interface IContentEntity {
  entityKey: string
  blockKey: string
  entity: IRawEntity
  start: number
  end: number
}

export const mentionTrigger = '$'
/**
 * Currently we need to ask the editor state for the list of entities inside it becuase we sync this with
 * external component state such as the tags list.  However, asking about entities reuires knowing the 
 * entity id and this is leakage of editor implementation details.
 * 
 * I'm not sure if this is hitting limitation of the plugin system or if this issue would still exist
 * even if we built our own mention/auto-complete editor.  We are starting to stretch
 *  the boundaries of what this plugin was meant to do. We could try to recreate the mention
 *  editor if needed, but save that as last resort.
 */
export const entityType = `${mentionTrigger}mention`

/**
 * Get entities from existing content state
 * https://stackoverflow.com/questions/46395930/draft-js-how-to-get-all-entities-data-from-the-contentstate
 */
export const getEntities = (editorState: EditorState, entityType: string | null = `${mentionTrigger}mention`): IContentEntity[] => {
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
}

/**
 * Get anchor and focus keys for each word in content
 */
