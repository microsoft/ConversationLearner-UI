import * as React from 'react'

const component = ({ app }: any) => (
    <div>
        <h1>App Index</h1>

        <div>
            Id: {app.id}<br />
            Name: {app.name}<br />
            Description: {app.description}<br />
        </div>
    </div>
)

export default component