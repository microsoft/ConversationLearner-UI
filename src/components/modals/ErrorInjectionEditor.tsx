import * as React from 'react';
import { connect } from 'react-redux';
import { Dialog, DialogType, Checkbox } from 'office-ui-fabric-react';
import { ErrorInjector } from '../../ErrorInjector';
import { AT } from '../../types/ActionTypes'

class ErrorInjectionEditor extends React.Component<ReceivedProps, {}> {

    private _onCheckboxChange(ev: React.FormEvent<HTMLElement>, isChecked: boolean, actionType: string) {
        ErrorInjector.SetError(actionType, isChecked);
    }

    render() {
        return (

            <Dialog
                hidden={!this.props.open}
                onDismiss={() => this.props.onClose()}
                dialogContentProps={{
                    type: DialogType.normal,
                }}
                modalProps={{
                    isBlocking: false
                }}
            >
            {Object.keys(AT).filter(key => key.indexOf("ASYNC") > -1).map(key => {
                return ( 
                        <Checkbox
                        key={key}
                        label={key}
                        onChange= { (ev, isChecked) => this._onCheckboxChange(ev, isChecked, key) }
                        ariaDescribedBy={ 'descriptionID' }
                        defaultChecked={ErrorInjector.ShouldError(AT[key])}
                        />
                    )})
            }
            </Dialog>
        )
    }
}

interface ReceivedProps {
    onClose: Function;
    open: boolean;
}

export default connect<ReceivedProps, {}, {}>(null, null)(ErrorInjectionEditor);