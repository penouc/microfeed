// Worker entry point for migrated Pages application
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method.toLowerCase();

    // Normalize pathname (remove trailing slash except for root)
    const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');

    // Log all requests
    console.log(`Worker request: ${method.toUpperCase()} ${pathname}`);

    try {
      // Create a context object to pass data between middleware and handlers
      const data = {};

      // Helper function to try route with and without trailing slash
      const tryRoute = (path) => pathname === path || pathname === path + '/';

      // Debug route for testing
      if (pathname === '/test-worker') {
        return new Response(`Worker is working! Path: ${pathname}, Method: ${method}`, {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      }

      // Home page
      if (pathname === '/') {
        const { onRequestGet } = await import('./functions/index.jsx');
        return await onRequestGet({ env, request, data });
      }

      // Admin routes (/admin/*)
      if (pathname.startsWith('/admin')) {
        console.log(`Admin route accessed: ${pathname}, method: ${method}`);

        // Handle AJAX routes first, before middleware
        console.log(`Checking AJAX routes for: ${pathname}, method: ${method}`);
        if (pathname.startsWith('/admin/ajax/')) {
          console.log(`Processing AJAX route: ${pathname}`);
          
          // Check r2-ops route
          const r2OpsMatch = tryRoute('/admin/ajax/r2-ops');
          console.log(`r2-ops match: ${r2OpsMatch}, pathname: ${pathname}, expected: /admin/ajax/r2-ops`);
          if (r2OpsMatch) {
            try {
              console.log('Loading r2-ops handler...');
              const handler = await import('./functions/admin/ajax/r2-ops.js');
              console.log('r2-ops handler loaded');
              if (method === 'post' && handler.onRequestPost) {
                console.log('Calling r2-ops POST handler...');
                const result = await handler.onRequestPost({ env, request, data });
                console.log('r2-ops handler completed');
                return result;
              }
              console.log(`r2-ops: method ${method} not allowed`);
              return new Response('Method not allowed', { status: 405 });
            } catch (error) {
              console.error('r2-ops error:', error);
              return new Response('R2 ops error: ' + error.message, { status: 500 });
            }
          }
          
          // Check feed route
          const feedMatch = tryRoute('/admin/ajax/feed');
          console.log(`feed match: ${feedMatch}, pathname: ${pathname}, expected: /admin/ajax/feed`);
          if (feedMatch) {
            try {
              console.log('Loading feed handler...');
              const handler = await import('./functions/admin/ajax/feed.js');
              console.log('feed handler loaded');
              if (method === 'get' && handler.onRequestGet) {
                console.log('Calling feed GET handler...');
                return await handler.onRequestGet({ env, request, data });
              }
              if (method === 'post' && handler.onRequestPost) {
                console.log('Calling feed POST handler...');
                return await handler.onRequestPost({ env, request, data });
              }
              console.log(`feed: method ${method} not allowed`);
              return new Response('Method not allowed', { status: 405 });
            } catch (error) {
              console.error('feed handler error:', error);
              return new Response('Feed handler error: ' + error.message, { status: 500 });
            }
          }
          
          console.log(`No AJAX route matched for: ${pathname}`);
          return new Response('AJAX endpoint not found', { status: 404 });
        }

        // Apply admin middleware first
        try {
          const adminMiddleware = await import('./functions/admin/_middleware.js');
          for (const middleware of adminMiddleware.onRequest) {
            const next = () => Promise.resolve();
            await middleware({ request, next, env, data });
          }
          console.log('Admin middleware completed successfully');
        } catch (error) {
          console.error('Admin middleware error:', error);
        }

        // Admin home
        if (tryRoute('/admin')) {
          const { onRequestGet } = await import('./functions/admin/index.jsx');
          return await onRequestGet({ env, request, data });
        }


        // Admin channels
        if (pathname.startsWith('/admin/channels')) {
          if (tryRoute('/admin/channels')) {
            const { onRequestGet } = await import('./functions/admin/channels/index.jsx');
            return await onRequestGet({ env, request, data });
          }
          if (tryRoute('/admin/channels/primary')) {
            const { onRequestGet } = await import('./functions/admin/channels/primary/index.jsx');
            return await onRequestGet({ env, request, data });
          }
        }

        // Admin feed
        if (pathname.startsWith('/admin/feed/')) {
          if (tryRoute('/admin/feed/json')) {
            const { onRequestGet } = await import('./functions/admin/feed/json.jsx');
            return await onRequestGet({ env, request, data });
          }
        }

        // Admin items
        if (pathname.startsWith('/admin/items')) {
          if (tryRoute('/admin/items')) {
            const { onRequestGet } = await import('./functions/admin/items/index.jsx');
            return await onRequestGet({ env, request, data });
          }
          if (tryRoute('/admin/items/list')) {
            const { onRequestGet } = await import('./functions/admin/items/list/index.jsx');
            return await onRequestGet({ env, request, data });
          }
          if (tryRoute('/admin/items/new')) {
            const { onRequestGet } = await import('./functions/admin/items/new/index.jsx');
            return await onRequestGet({ env, request, data });
          }

          // Handle dynamic item IDs: /admin/items/{itemId}
          const itemIdMatch = normalizedPath.match(/^\/admin\/items\/([^\/]+)$/);
          if (itemIdMatch) {
            const { onRequestGet } = await import('./functions/admin/items/[itemId]/index.jsx');
            return await onRequestGet({ env, request, data });
          }
        }

        // Admin settings
        if (pathname.startsWith('/admin/settings')) {
          if (tryRoute('/admin/settings')) {
            const { onRequestGet } = await import('./functions/admin/settings/index.jsx');
            return await onRequestGet({ env, request, data });
          }
          if (tryRoute('/admin/settings/code-editor')) {
            const { onRequestGet } = await import('./functions/admin/settings/code-editor/index.jsx');
            return await onRequestGet({ env, request, data });
          }
        }
      }

      // API routes (/api/*)
      if (pathname.startsWith('/api/')) {
        // Apply API middleware first
        try {
          const apiMiddleware = await import('./functions/api/_middleware.js');
          let middlewareResult = null;
          for (const middleware of apiMiddleware.onRequest) {
            const next = () => {
              middlewareResult = 'continue';
              return Promise.resolve();
            };
            const result = await middleware({ request, next, env, data });
            if (result instanceof Response) {
              return result;
            }
            if (middlewareResult !== 'continue') {
              return new Response('Unauthorized', { status: 401 });
            }
          }
        } catch (error) {
          if (error instanceof Response) {
            return error;
          }
          return new Response('Unauthorized', { status: 401 });
        }

        // API feed
        if (tryRoute('/api/feed')) {
          const handler = await import('./functions/api/feed/index.js');
          if (method === 'get' && handler.onRequestGet) {
            return await handler.onRequestGet({ env, request, data });
          }
          if (method === 'head' && handler.onRequestHead) {
            return await handler.onRequestHead({ env, request, data });
          }
        }

        // API channels
        if (pathname.startsWith('/api/channels/')) {
          const channelIdMatch = normalizedPath.match(/^\/api\/channels\/([^\/]+)$/);
          if (channelIdMatch) {
            const handler = await import('./functions/api/channels/[channelId]/index.jsx');
            if (method === 'put' && handler.onRequestPut) {
              return await handler.onRequestPut({ env, request, data });
            }
          }
        }

        // API items
        if (pathname.startsWith('/api/items')) {
          if (tryRoute('/api/items')) {
            const handler = await import('./functions/api/items/index.jsx');
            if (method === 'post' && handler.onRequestPost) {
              return await handler.onRequestPost({ env, request, data });
            }
          }

          // Handle dynamic item IDs: /api/items/{itemId}
          const itemIdMatch = normalizedPath.match(/^\/api\/items\/([^\/]+)$/);
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

        // API media files
        if (pathname.startsWith('/api/media_files/')) {
          if (tryRoute('/api/media_files/presigned_urls')) {
            const handler = await import('./functions/api/media_files/presigned_urls/index.jsx');
            if (method === 'post' && handler.onRequestPost) {
              return await handler.onRequestPost({ env, request, data });
            }
          }
        }

        // API comments
        if (pathname.startsWith('/api/comments')) {
          if (tryRoute('/api/comments')) {
            const handler = await import('./functions/api/comments/index.jsx');
            if (method === 'post' && handler.onRequestPost) {
              return await handler.onRequestPost({ env, request, data });
            }
          }

          // Handle dynamic item IDs: /api/comments/{itemId}
          const itemIdMatch = normalizedPath.match(/^\/api\/comments\/([^\/]+)$/);
          if (itemIdMatch) {
            const itemId = itemIdMatch[1];
            const handler = await import('./functions/api/comments/[itemId]/index.jsx');
            if (method === 'get' && handler.onRequestGet) {
              return await handler.onRequestGet({ params: { itemId }, env, request, data });
            }
          }
        }
      }

      // Individual item pages (/i/*)
      console.log(`Checking /i/ routes for: ${pathname}`);
      if (pathname.startsWith('/i/')) {
        console.log(`Processing /i/ route: ${pathname}, normalized: ${normalizedPath}`);
        
        // Handle /i/{slug} - with or without trailing slash
        const slugMatch = normalizedPath.match(/^\/i\/([^\/]+?)\/?$/);
        console.log(`slug match result: ${slugMatch}, pattern: /^\/i\/([^\/]+?)\/?$/`);
        if (slugMatch) {
          const slug = slugMatch[1];
          console.log(`Matched slug: ${slug}, calling handler...`);
          try {
            const { onRequestGet } = await import('./functions/i/[slug]/index.jsx');
            return await onRequestGet({params: {slug}, env, request});
          } catch (error) {
            console.error(`Error loading i/[slug]/index.jsx:`, error);
            return new Response(`Error loading item page: ${error.message}`, {status: 500});
          }
        }

        // Handle /i/{slug}/json
        const jsonMatch = normalizedPath.match(/^\/i\/([^\/]+)\/json\/?$/);
        console.log(`json match result: ${jsonMatch}`);
        if (jsonMatch) {
          const slug = jsonMatch[1];
          console.log(`Matched JSON slug: ${slug}, calling handler...`);
          try {
            const handler = await import('./functions/i/[slug]/json/index.jsx');
            if (method === 'get' && handler.onRequestGet) {
              return await handler.onRequestGet({params: {slug}, env, request});
            }
            if (method === 'head' && handler.onRequestHead) {
              return await handler.onRequestHead({params: {slug}, env, request});
            }
          } catch (error) {
            console.error(`Error loading i/[slug]/json/index.jsx:`, error);
            return new Response(`Error loading JSON: ${error.message}`, {status: 500});
          }
        }

        // Handle /i/{slug}/rss
        const rssMatch = normalizedPath.match(/^\/i\/([^\/]+)\/rss\/?$/);
        console.log(`rss match result: ${rssMatch}`);
        if (rssMatch) {
          const slug = rssMatch[1];
          console.log(`Matched RSS slug: ${slug}, calling handler...`);
          try {
            const { onRequestGet } = await import('./functions/i/[slug]/rss/index.jsx');
            return await onRequestGet({params: {slug}, env, request});
          } catch (error) {
            console.error(`Error loading i/[slug]/rss/index.jsx:`, error);
            return new Response(`Error loading RSS: ${error.message}`, {status: 500});
          }
        }
        
        console.log(`No /i/ route matched for: ${pathname}`);
      }

      // JSON routes (/json/*)
      if (pathname.startsWith('/json')) {
        if (tryRoute('/json')) {
          const handler = await import('./functions/json/index.jsx');
          if (method === 'get' && handler.onRequestGet) {
            return await handler.onRequestGet({ env, request, data });
          }
          if (method === 'head' && handler.onRequestHead) {
            return await handler.onRequestHead({ env, request, data });
          }
        }

        if (tryRoute('/json/openapi.yaml')) {
          const handler = await import('./functions/json/openapi.yaml/index.jsx');
          if (method === 'get' && handler.onRequestGet) {
            return await handler.onRequestGet({ env, request, data });
          }
          if (method === 'head' && handler.onRequestHead) {
            return await handler.onRequestHead({ env, request, data });
          }
        }
      }

      // RSS routes (/rss/*)
      if (pathname.startsWith('/rss')) {
        if (tryRoute('/rss')) {
          const handler = await import('./functions/rss/index.jsx');
          if (method === 'get' && handler.onRequestGet) {
            return await handler.onRequestGet({ env, request, data });
          }
          if (method === 'head' && handler.onRequestHead) {
            return await handler.onRequestHead({ env, request, data });
          }
        }

        if (tryRoute('/rss/stylesheet')) {
          const { onRequestGet } = await import('./functions/rss/stylesheet.jsx');
          return await onRequestGet({ env, request, data });
        }
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