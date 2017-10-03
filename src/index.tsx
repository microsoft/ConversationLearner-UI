import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createReduxStore } from './reduxStore'
// TODO: Use new App which has proper routing
// import App from './component/App';
import App from './containers/App';
import registerServiceWorker from './registerServiceWorker';
// import './index.css';

ReactDOM.render(
  <Provider store={createReduxStore()}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
