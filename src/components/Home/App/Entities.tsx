import * as React from 'react'
import { CommandButton, SearchBox } from 'office-ui-fabric-react'

const component = (props: any) => (
    <div className="blis-page">
        <h1 className="ms-font-xxl">Entities</h1>
        <p className="ms-font-m-plus">Manage a list of entities in your application and track and control their instances within actions...</p>
        <div>
            <CommandButton
                className='blis-button blis-button--primary'
                ariaDescription='Create a New Entity'
                text='New Entity'
            />
        </div>
        <SearchBox
            className="ms-font-m-plus"
        />
    </div>
)

export default component