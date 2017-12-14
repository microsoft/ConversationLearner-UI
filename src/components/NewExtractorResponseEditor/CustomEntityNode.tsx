import * as React from 'react'
import CustomEntity from './CustomEntity'
import { IOption } from './models'

/* Simulate entity component props which have children */
interface EntityComponentProps {
    editor: any
    node: any
    attributes: any
    children: any
    readOnly: boolean
}

interface Props extends EntityComponentProps {
    onClickDelete: (option: IOption) => void
}

interface State {
    isEditing: boolean
}

export class CustomEntityContainer extends React.Component<Props, State> {
    state: State = {
        isEditing: false
    }

    onClickName = () => {
        if (this.props.readOnly) {
            return
        }

        this.setState(prevState => ({
            isEditing: !prevState.isEditing
        }))
    }

    onClickDelete = () => {
        if (this.props.readOnly) {
            return
        }
        
        this.setState({
            isEditing: false
        })

        this.props.editor.change((change: any) => {
            change.unwrapInlineByKey(this.props.node.key, this.props.node.type)
        })
    }

    render() {
        const nodeData = this.props.node.data.toJS()
        const option: IOption = nodeData.option

        return (
            <CustomEntity
                isEditing={this.state.isEditing}
                name={option.name}
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