import React from 'react';
import ReactDOM from 'react-dom/client';
import CommentSection from '../components/CommentSection';
import {initializeApp} from '../common/AppInitializer';

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  
  const $commentRoot = document.getElementById('comments-root');
  if ($commentRoot) {
    const itemId = $commentRoot.getAttribute('data-item-id');
    if (itemId) {
      const root = ReactDOM.createRoot($commentRoot);
      root.render(
        <React.StrictMode>
          <CommentSection itemId={itemId} />
        </React.StrictMode>
      );
    }
  }
});