import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './containers/App';
import { Provider } from 'react-redux';
import { createReduxStore } from './reduxStore'

ReactDOM.render(
    <Provider store={createReduxStore()}>
        <App />
    </Provider>
    , document.getElementById('root'));
