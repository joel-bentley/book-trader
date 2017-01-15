import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router';
import App from './App';
import './index.css';

ReactDOM.render(
  (
    <BrowserRouter>
      {({ router }) => <App {...{ router }} />}
    </BrowserRouter>
  ),
  document.getElementById('root'),
);
