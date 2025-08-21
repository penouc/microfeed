import React from 'react';
import {initializeApp} from '../common/AppInitializer';
import ReactDOM from 'react-dom/client';
import AdminHomeApp from './components/AdminHomeApp';

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  const $rootDom = document.getElementById('client-side-root');
  if ($rootDom) {
    const root = ReactDOM.createRoot($rootDom);
    root.render(
      <React.StrictMode>
        <AdminHomeApp/>
      </React.StrictMode>
    );
  }
});
