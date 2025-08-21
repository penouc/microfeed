import React from 'react';
import HtmlHeader from "../components/HtmlHeader";
import {htmlMetaDescription} from "../../common-src/StringUtils";
import {getSeoConfig, buildOpenGraphTags, buildTwitterCardTags, generateStructuredData} from "../common/SeoUtils";

export default class EdgeItemApp extends React.Component {
  render() {
    const {item, theme, jsonData, canonicalUrl, feed} = this.props;
    const {html} = theme.getWebItem(item);
    const seoConfig = getSeoConfig(feed);
    const openGraph = buildOpenGraphTags(item, jsonData, seoConfig, canonicalUrl);
    const twitterCard = buildTwitterCardTags(item, jsonData, seoConfig, canonicalUrl);
    const structuredData = generateStructuredData(item, jsonData, canonicalUrl);
    
    return (
      <html lang={jsonData.language || 'en'}>
      <HtmlHeader
        title={item.title}
        description={htmlMetaDescription(item.content_text, false)}
        webpackJsList={['comments_js']}
        webpackCssList={[]}
        canonicalUrl={canonicalUrl}
        googleAnalyticsId={seoConfig.googleAnalyticsId}
        openGraph={openGraph}
        twitterCard={twitterCard}
        favicon={{
          // 'apple-touch-icon': '/assets/apple-touch-icon.png',
          // '32x32': '/assets/favicon-32x32.png',
          // '16x16': '/assets/favicon-16x16.png',
          // 'manifest': '/assets/site.webmanifest',
          // 'mask-icon': {
          //   'href': '/assets/safari-pinned-tab.svg',
          //   'color': '#b82f00',
          // },
          // 'msapplication-TileColor': '#da532c',
          // 'theme-color': '#ffffff',
        }}
      />
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(structuredData)}} />
        <div dangerouslySetInnerHTML={{__html: html}} />
      </body>
      </html>
    );
  }
}
