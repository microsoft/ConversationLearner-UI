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
  };