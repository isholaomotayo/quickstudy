"use client";
import Head from "next/head";
import { useState, useEffect } from "react";
import Header from "./Header";
import Breadcrumbs from "./Breadcrumbs";
import Sidebar from "./Sidebar";
import ModalProvider from "./ModalProvider";
import { getAccessLinks } from "../helpers/accessRights";

const logoStyle = {
  display: "inline-block",
  font: "20px Helvetica,Arial,Verdana,Sans-Serif",
  fontWeight: "bold",
  margin: "20",
  padding: "20",
  color: "#333",
};

const Layout = ({
  showHeader = true,
  showBreadcrumb = true,
  showSidebar = true,
  ...props
}) => {
  const appTitle = `iLearn`;
  const [navOpen, setNavOpen] = useState(false);
  const [pagePath, setPagePath] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") setPagePath(window.location.pathname);
  }, []);
  const myRole = (props.userData && props.userData.role) || "APPLICANT";
  const myLinks = getAccessLinks(myRole);

  let envName = "";
  if (process.env.NODE_ENV == "development") envName = "Dev";

  return (
    <ModalProvider>
      <div className={`${navOpen ? "set-nav-open" : ""}`}>
        <Head>
          <meta httpEquiv="content-type" content="text/html;charset=UTF-8" />
          <meta charSet="utf-8" />
          <title>{`${appTitle}${
            props.pageTitle ? " :: " + props.pageTitle : ""
          } ${envName ? " >>>> " + envName : ""}
        `}</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no"
          />
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-touch-fullscreen" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta content="" name="description" />
          <meta content="" name="author" />
        </Head>
        {props.noWrappers ? (
          props.children
        ) : (
          <>
            <Sidebar
              pagePath={pagePath}
              links={myLinks}
              appTitle={appTitle}
              logoStyle={logoStyle}
              navOpen={navOpen}
            />
            <div className="page-container">
              <Header
                appTitle={appTitle}
                logoStyle={logoStyle}
                userData={props.userData}
                navManagers={[navOpen, setNavOpen]}
              />
              {props.showBreadcrumb ? (
                <div className="jumbotron " style={{ marginBottom: "0" }}>
                  <div className="container-fluid container-fixed-lg sm-p-l-0 sm-p-r-0">
                    <Breadcrumbs
                      pagePath={pagePath}
                      pageTitle={props.pageTitle}
                      parentNavs={props.parentNavs}
                    />
                  </div>
                </div>
              ) : (
                ""
              )}

              <div className="card card-transparent ">
                <div
                  className="card-body"
                  style={{ backgroundColor: `${props.color}` }}
                >
                  {props.children}
                </div>
              </div>
            </div>
          </>
        )}
        <style global jsx>{`
          .bg-dark-purple {
            background: #2d3446 !important;
            color: #fff;
            font-weight: bold;
          }
          .sidebar-header .app-logo {
            color: #fff;
          }
          .set-nav-open .page-container {
            -webkit-transform: translate3d(280px, 0, 0);
            transform: translate3d(280px, 0, 0);
            -ms-transform: translate(280px, 0);
            overflow: hidden;
            position: fixed;
          }

          .card-header {
            padding: 0.75rem 1.25rem !important;
          }

          .card-header.full-header {
            border-bottom: 1px solid rgba(0, 0, 0, 0.125) !important;
            background-color: rgba(0, 0, 0, 0.03) !important;
          }

          mobile .sidebar-menu {
            overflow: scroll;
            -webkit-overflow-scrolling: touch;
          }

          mobile .sidebar-menu > ul {
            height: auto !important;
            overflow: visible !important;
            -webkit-overflow-scrolling: touch !important;
          }
          mobile .page-sidebar .sidebar-menu .menu-items li:hover a {
            color: #788195;
          }
          mobile
            .page-sidebar
            .sidebar-menu
            .menu-items
            li:hover
            .icon-thumbnail {
          }
          mobile .page-sidebar .sidebar-menu .menu-items li.active > a,
          mobile .page-sidebar .sidebar-menu .menu-items li.open > a {
            color: #fff;
          }
          mobile
            .page-sidebar
            .sidebar-menu
            .menu-items
            li.active
            > .icon-thumbnail,
          mobile
            .page-sidebar
            .sidebar-menu
            .menu-items
            li.open
            > .icon-thumbnail {
            color: #fff;
          }
          mobile .drager {
            overflow: auto;
            -webkit-overflow-scrolling: touch;
          }
          .underline {
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
            margin-bottom: 5px;
          }
          .underline-dash {
            border-bottom: 1px dashed #ccc;
            padding-bottom: 5px;
            margin-bottom: 5px;
          }

          @media (min-width: 576px) {
            .col-sm-30 {
              width: 30%;
            }
            .col-sm-30-rowed {
              width: 30%;
              margin: 0.5em 1%;
              vertical-align: top;
            }
            .col-sm-70 {
              width: 70%;
            }
          }
        `}</style>
      </div>
    </ModalProvider>
  );
};

export default Layout;
