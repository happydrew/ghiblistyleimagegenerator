import type { AppProps } from 'next/app'
import { type ReactElement } from 'react'
import Script from 'next/script';
import Head from 'next/head';
import '../style.css';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps): ReactElement {
  // useEffect(() => {
  //   document.documentElement.classList.add('dark')
  // }, []);

  return (<>
    <Head>
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />

      {/* Google Adsense */}
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4907197973761221" crossOrigin="anonymous"></script>
      <meta name="google-adsense-account" content="ca-pub-4907197973761221" />
    </Head>

    {/* moneytag adsense */}
    {/* Native Banner (Interstitial) */}
    <Script>
      {`
        (function(d,z,s){s.src='https://'+d+'/401/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('groleegni.net',9150813,document.createElement('script'))
        `}
    </Script>

    {/* Vignette Banner */}
    <Script data-cfasync="false" type="text/javascript">
      {`
        (function(d,z,s){s.src='https://'+d+'/401/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('gizokraijaw.net',9150834,document.createElement('script'))
        `}
    </Script>

    {/* Google tag (gtag.js) */}
    <Script async src="https://www.googletagmanager.com/gtag/js?id=G-NXCK9TQMKX"></Script>
    <Script>
      {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-NXCK9TQMKX');
      `}
    </Script>

    <Component {...pageProps} />
  </>)
}
