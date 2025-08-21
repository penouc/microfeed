import React from 'react';
import HtmlHeader from "../components/HtmlHeader";
import {htmlMetaDescription} from "../../common-src/StringUtils";
import {getSeoConfig, buildOpenGraphTags, buildTwitterCardTags, generateStructuredData} from "../common/SeoUtils";

export default class EdgeHomeApp extends React.Component {
  render() {
    const {jsonData, theme, feed} = this.props;
    const { html } = theme.getWebFeed();
    const seoConfig = getSeoConfig(feed);
    const openGraph = buildOpenGraphTags(null, jsonData, seoConfig, jsonData.home_page_url);
    const twitterCard = buildTwitterCardTags(null, jsonData, seoConfig, jsonData.home_page_url);
    const structuredData = generateStructuredData(null, jsonData, jsonData.home_page_url);
    
    return (
      <html lang={jsonData.language || 'en'}>
      <HtmlHeader
        title={jsonData.title}
        description={htmlMetaDescription(jsonData._microfeed.description_text, false)}
        webpackJsList={[]}
        webpackCssList={[]}
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
      <div id="client-side-root"/>
      </body>
      </html>
    );
  }
}
