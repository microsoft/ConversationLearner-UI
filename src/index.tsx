import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers/root';
import './assets/index.css';

ReactDOM.render(
    <Provider store={createStore(rootReducer)}>
        <App />
    </Provider>
    , document.getElementById('root'));
