/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import CustomEntity from './CustomEntity'
import { IGenericEntityData } from './models'

// Simulate entity component props which have children
interface EntityComponentProps {
    editor: any
    node: any
    attributes: any
    children: any
    readOnly: boolean
}

interface Props extends EntityComponentProps {
    onDeleteButtonVisible: (isOpen: boolean) => {}
}

interface State {
    isDeleteButtonOpen: boolean
}

export class CustomEntityContainer extends React.Component<Props, State> {
    state: State = {
        isDeleteButtonOpen: false
    }

    onClickName = () => {
        if (this.props.readOnly) {
            return
        }

        let isDeleteButtonOpen = !this.state.isDeleteButtonOpen

        this.setState({isDeleteButtonOpen})
        this.props.onDeleteButtonVisible(isDeleteButtonOpen)
    }

    onClickDelete = () => {
        if (this.props.readOnly) {
            return
        }
        
        this.setState({
            isDeleteButtonOpen: false
        })
        this.props.onDeleteButtonVisible(false)

        this.props.editor.change((change: any) => {
            change.unwrapInlineByKey(this.props.node.key, this.props.node.type)
        })
    }

    render() {
        const nodeData: IGenericEntityData<any> = this.props.node.data.toJS()
        const { displayName } = nodeData

        return (
            <CustomEntity
                isDeleteButtonOpen={this.state.isDeleteButtonOpen}
                name={displayName}
                onClickName={this.onClickName}
                onClickDelete={this.onClickDelete}
                readOnly={this.props.readOnly}
                {...this.props.attributes}
            >
                {...this.props.children}
            </CustomEntity>
        )
    }
}

export default CustomEntityContainer