import * as React from 'react'
import { CommandButton, SearchBox } from 'office-ui-fabric-react'

const component = (props: any) => (
    <div className="blis-page">
        <h1 className="ms-font-xxl">Actions</h1>
        <p className="ms-font-m-plus">Manage a list of actions that your application can take given it's state and user input...</p>
        <div>
            <CommandButton
                data-automation-id='randomID20'
                disabled={false}
                className='blis-button blis-button--primary'
                ariaDescription='Create a New Action'
                text='New Action'
            />
        </div>
        <SearchBox
            className="ms-font-m-plus"
        />
    </div>
)

export default component