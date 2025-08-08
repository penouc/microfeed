// Worker entry point for migrated Pages application
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method.toLowerCase();

    try {
      // Create a context object to pass data between middleware and handlers
      const data = {};
      
      // Route dynamic endpoints first
      
      // Home page
      if (pathname === '/') {
        const { onRequestGet } = await import('./functions/index.jsx');
        return await onRequestGet({ env, request, data });
      }
      
      // Admin routes
      if (pathname.startsWith('/admin')) {
        // Apply admin middleware first
        const adminMiddleware = await import('./functions/admin/_middleware.js');
        for (const middleware of adminMiddleware.onRequest) {
          const next = () => Promise.resolve();
          await middleware({ request, next, env, data });
        }
        
        if (pathname === '/admin' || pathname === '/admin/') {
          const { onRequestGet } = await import('./functions/admin/index.jsx');
          return await onRequestGet({ env, request, data });
        }
        
        if (pathname.startsWith('/admin/items/')) {
          if (pathname === '/admin/items' || pathname === '/admin/items/') {
            const { onRequestGet } = await import('./functions/admin/items/index.jsx');
            return await onRequestGet({ env, request, data });
          }
          if (pathname === '/admin/items/list') {
            const { onRequestGet } = await import('./functions/admin/items/list/index.jsx');
            return await onRequestGet({ env, request, data });
          }
          if (pathname === '/admin/items/new') {
            const { onRequestGet } = await import('./functions/admin/items/new/index.jsx');
            return await onRequestGet({ env, request, data });
          }
          // Handle dynamic item IDs
          const itemIdMatch = pathname.match(/^\/admin\/items\/([^\/]+)$/);
          if (itemIdMatch) {
            const { onRequestGet } = await import('./functions/admin/items/[itemId]/index.jsx');
            return await onRequestGet({ env, request, data });
          }
        }
        
        if (pathname.startsWith('/admin/channels')) {
          if (pathname === '/admin/channels' || pathname === '/admin/channels/') {
            const { onRequestGet } = await import('./functions/admin/channels/index.jsx');
            return await onRequestGet({ env, request, data });
          }
          if (pathname === '/admin/channels/primary' || pathname === '/admin/channels/primary/') {
            const { onRequestGet } = await import('./functions/admin/channels/primary/index.jsx');
            return await onRequestGet({ env, request, data });
          }
        }
        
        if (pathname.startsWith('/admin/settings')) {
          if (pathname === '/admin/settings' || pathname === '/admin/settings/') {
            const { onRequestGet } = await import('./functions/admin/settings/index.jsx');
            return await onRequestGet({ env, request, data });
          }
          if (pathname === '/admin/settings/code-editor' || pathname === '/admin/settings/code-editor/') {
            const { onRequestGet } = await import('./functions/admin/settings/code-editor/index.jsx');
            return await onRequestGet({ env, request, data });
          }
        }
        
        if (pathname.startsWith('/admin/ajax/')) {
          if (pathname === '/admin/ajax/feed') {
            const handler = await import('./functions/admin/ajax/feed.js');
            if (method === 'get' && handler.onRequestGet) {
              return await handler.onRequestGet({ env, request, data });
            }
            if (method === 'post' && handler.onRequestPost) {
              return await handler.onRequestPost({ env, request, data });
            }
          }
          if (pathname === '/admin/ajax/r2-ops') {
            const handler = await import('./functions/admin/ajax/r2-ops.js');
            if (method === 'post' && handler.onRequestPost) {
              return await handler.onRequestPost({ env, request, data });
            }
          }
        }
        
        if (pathname.startsWith('/admin/feed/')) {
          if (pathname === '/admin/feed/json') {
            const { onRequestGet } = await import('./functions/admin/feed/json.jsx');
            return await onRequestGet({ env, request, data });
          }
        }
      }
      
      // API routes
      if (pathname.startsWith('/api/')) {
        // Apply API middleware first
        const apiMiddleware = await import('./functions/api/_middleware.js');
        try {
          for (const middleware of apiMiddleware.onRequest) {
            const next = () => Promise.resolve();
            await middleware({ request, next, env, data });
          }
        } catch (error) {
          if (error instanceof Response) {
            return error;
          }
          return new Response('Unauthorized', { status: 401 });
        }
        
        if (pathname === '/api/feed') {
          const handler = await import('./functions/api/feed/index.js');
          if (method === 'get' && handler.onRequestGet) {
            return await handler.onRequestGet({ env, request, data });
          }
        }
        
        if (pathname.startsWith('/api/items')) {
          if (pathname === '/api/items' || pathname === '/api/items/') {
            const handler = await import('./functions/api/items/index.jsx');
            if (method === 'get' && handler.onRequestGet) {
              return await handler.onRequestGet({ env, request, data });
            }
            if (method === 'post' && handler.onRequestPost) {
              return await handler.onRequestPost({ env, request, data });
            }
          }
          // Handle dynamic item IDs
          const itemIdMatch = pathname.match(/^\/api\/items\/([^\/]+)$/);
          if (itemIdMatch) {
            const handler = await import('./functions/api/items/[itemId]/index.jsx');
            if (method === 'get' && handler.onRequestGet) {
              return await handler.onRequestGet({ env, request, data });
            }
            if (method === 'put' && handler.onRequestPut) {
              return await handler.onRequestPut({ env, request, data });
            }
            if (method === 'delete' && handler.onRequestDelete) {
              return await handler.onRequestDelete({ env, request, data });
            }
          }
        }
        
        if (pathname.startsWith('/api/channels/')) {
          const channelIdMatch = pathname.match(/^\/api\/channels\/([^\/]+)$/);
          if (channelIdMatch) {
            const handler = await import('./functions/api/channels/[channelId]/index.jsx');
            if (method === 'get' && handler.onRequestGet) {
              return await handler.onRequestGet({ env, request, data });
            }
          }
        }
        
        if (pathname === '/api/media_files/presigned_urls') {
          const handler = await import('./functions/api/media_files/presigned_urls/index.jsx');
          if (method === 'post' && handler.onRequestPost) {
            return await handler.onRequestPost({ env, request, data });
          }
        }
      }
      
      // Individual item pages
      if (pathname.startsWith('/i/')) {
        const slugMatch = pathname.match(/^\/i\/([^\/]+)$/);
        if (slugMatch) {
          const { onRequestGet } = await import('./functions/i/[slug]/index.jsx');
          return await onRequestGet({ env, request, data });
        }
        
        const jsonMatch = pathname.match(/^\/i\/([^\/]+)\/json$/);
        if (jsonMatch) {
          const { onRequestGet } = await import('./functions/i/[slug]/json/index.jsx');
          return await onRequestGet({ env, request, data });
        }
        
        const rssMatch = pathname.match(/^\/i\/([^\/]+)\/rss$/);
        if (rssMatch) {
          const { onRequestGet } = await import('./functions/i/[slug]/rss/index.jsx');
          return await onRequestGet({ env, request, data });
        }
      }
      
      // JSON feed
      if (pathname === '/json') {
        const { onRequestGet } = await import('./functions/json/index.jsx');
        return await onRequestGet({ env, request, data });
      }
      
      if (pathname === '/json/openapi.yaml') {
        const { onRequestGet } = await import('./functions/json/openapi.yaml/index.jsx');
        return await onRequestGet({ env, request, data });
      }
      
      // RSS feed
      if (pathname === '/rss') {
        const { onRequestGet } = await import('./functions/rss/index.jsx');
        return await onRequestGet({ env, request, data });
      }
      
      if (pathname === '/rss/stylesheet') {
        const { onRequestGet } = await import('./functions/rss/stylesheet.jsx');
        return await onRequestGet({ env, request, data });
      }
      
      // Sitemap
      if (pathname === '/sitemap.xml') {
        const { onRequestGet } = await import('./functions/sitemap.xml.jsx');
        return await onRequestGet({ env, request, data });
      }

      // For all other requests, try to serve static assets
      return await env.ASSETS.fetch(request);
      
    } catch (e) {
      console.error('Worker error:', e);
      // If everything fails, try to serve static assets or return 404
      try {
        return await env.ASSETS.fetch(request);
      } catch (assetError) {
        return new Response('Not Found', { status: 404 });
      }
    }
  },
};