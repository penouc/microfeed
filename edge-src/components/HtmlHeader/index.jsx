import React from 'react';

const webpackStats = require("../../../functions/webpack-stats.json");

export default class HtmlHeader extends React.Component {
  getWebpackRealUrl(key) {
    try {
      return webpackStats.assets[webpackStats.chunks[key][0]].publicPath;
    } catch (err) {
      return null;
    }
  }

  render() {
    const {
      title,
      description,
      webpackJsList,
      webpackCssList,
      favicon,
      canonicalUrl,
      googleAnalyticsId,
      openGraph,
      twitterCard,
    } = this.props;
    return (
      <head>
        <meta charSet="utf-8"/>
        <title>{title}</title>
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        {description && <meta name="description" content={description}/>}
        
        {/* Open Graph tags */}
        {openGraph && openGraph.title && <meta property="og:title" content={openGraph.title} />}
        {openGraph && openGraph.description && <meta property="og:description" content={openGraph.description} />}
        {openGraph && openGraph.type && <meta property="og:type" content={openGraph.type} />}
        {openGraph && openGraph.url && <meta property="og:url" content={openGraph.url} />}
        {openGraph && openGraph.image && <meta property="og:image" content={openGraph.image} />}
        {openGraph && openGraph.siteName && <meta property="og:site_name" content={openGraph.siteName} />}
        
        {/* Twitter Card tags */}
        {twitterCard && <meta name="twitter:card" content={twitterCard.card || "summary"} />}
        {twitterCard && twitterCard.site && <meta name="twitter:site" content={twitterCard.site} />}
        {twitterCard && twitterCard.creator && <meta name="twitter:creator" content={twitterCard.creator} />}
        {twitterCard && twitterCard.title && <meta name="twitter:title" content={twitterCard.title} />}
        {twitterCard && twitterCard.description && <meta name="twitter:description" content={twitterCard.description} />}
        {twitterCard && twitterCard.image && <meta name="twitter:image" content={twitterCard.image} />}
        
        {/* Performance optimizations */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Google Analytics */}
        {googleAnalyticsId && (
          <>
            <link rel="preconnect" href="https://www.googletagmanager.com" />
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}></script>
            <script dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}');
              `
            }}></script>
          </>
        )}
        {webpackJsList && webpackJsList.length > 0 && webpackJsList.map((js) => {
          const realUrl = this.getWebpackRealUrl(js);
          return (realUrl ? <script key={js} type="text/javascript" src={realUrl} defer/> : '');
        })}
        {webpackCssList && webpackCssList.length > 0 && webpackCssList.map((css) => {
          const realUrl = this.getWebpackRealUrl(css);
          return (realUrl ? <link key={css} rel="stylesheet" type="text/css" href={realUrl}/> : '');
        })}
        {favicon && favicon['apple-touch-icon'] && <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={favicon['apple-touch-icon']}
        />}
        {favicon && favicon['32x32'] && <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={favicon['32x32']}
        />}
        {favicon && favicon['16x16'] && <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={favicon['16x16']}
        />}
        {favicon && favicon['manifest'] && <link
          rel="manifest"
          href={favicon['manifest']}
        />}
        {favicon && favicon['theme-color'] && <meta
          name="theme-color"
          content={favicon['theme-color']}
        />}
        {favicon && favicon['msapplication-TileColor'] && <meta
          name="msapplication-TileColor"
          content={favicon['msapplication-TileColor']}
        />}
        {favicon && favicon['mask-icon'] && favicon['mask-icon'].href && favicon['mask-icon'].color && <link
          rel="mask-icon"
          href={favicon['mask-icon'].href}
          color={favicon['mask-icon'].color}
        />}
      </head>
    );
  }
}
