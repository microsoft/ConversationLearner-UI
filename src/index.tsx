import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './containers/App';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers/root';
ReactDOM.render(
    <Provider store={createStore(rootReducer)}>
        <App />
    </Provider>
    , document.getElementById('root'));
