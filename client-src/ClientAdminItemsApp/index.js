import React from 'react';
import ReactDOM from 'react-dom/client';
import AllItemsApp from './components/AllItemsApp';
import {initializeApp} from '../common/AppInitializer';

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  
  const $rootDom = document.getElementById('client-side-root');
  if ($rootDom) {
    const root = ReactDOM.createRoot($rootDom);
    root.render(
      <React.StrictMode>
        <AllItemsApp/>
      </React.StrictMode>
    );
  }
});
