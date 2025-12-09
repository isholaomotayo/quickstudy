import React from 'react';
import Head from 'next/head';
import { withRouter } from 'next/router';


const defaultLayout = (props) => {
  
  const appTitle = 'iLearn';

  return (
    <div>
    <Head>
      <meta httpEquiv="content-type" content="text/html;charset=UTF-8" />
      <meta charSet="utf-8" />
      <title>{ `${appTitle}${props.pageTitle ? ` :: ${props.pageTitle}` : ''}` }</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
      <link rel="apple-touch-icon" href="/pages/ico/60.png" />
      <link rel="apple-touch-icon" sizes="76x76" href="/pages/ico/76.png" />
      <link rel="apple-touch-icon" sizes="120x120" href="/pages/ico/120.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/pages/ico/152.png" />
      <link rel="icon" type="image/x-icon" href="favicon.ico" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-touch-fullscreen" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta content="" name="description" />
      <meta content="" name="author" />
      <link href="/assets/plugins/pace/pace-theme-flash.css" rel="stylesheet" type="text/css" />
      <link href="/assets/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
      <link href="/assets/plugins/font-awesome/css/font-awesome.css" rel="stylesheet" type="text/css" />
      <link href="/assets/plugins/jquery-scrollbar/jquery.scrollbar.css" rel="stylesheet" type="text/css" media="screen" />
      <link href="/assets/plugins/select2/css/select2.min.css" rel="stylesheet" type="text/css" media="screen" />
      <link href="/assets/plugins/switchery/css/switchery.min.css" rel="stylesheet" type="text/css" media="screen" />
      <link href="/pages/css/pages-icons.css" rel="stylesheet" type="text/css" />
      <link className="main-stylesheet" href="/pages/css/pages.css" rel="stylesheet" type="text/css" />
    </Head>


    {props.children}

    <style global jsx>
      {`
      .app-logo {
        display: inline-block;
        font: 20px Helvetica,Arial,Verdana,Sans-Serif;
        fontWeight: bold;
        margin: 20;
        padding: 20;
        color: #333;
      }

      .sidebar-header .app-logo  {
        color: #fff;
      }

      @media (min-width: 576px) {
        .col-sm-30 { width: 30%; }
        .col-sm-30-rowed { width: 30%; margin: 0.5em 1%; vertical-align: top; }
        .col-sm-70 { width: 70%; }
      }
      `}

    </style>
    </div>
  );
};
export default withRouter(defaultLayout);
