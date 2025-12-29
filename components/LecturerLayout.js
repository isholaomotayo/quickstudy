import Head from "next/head";

import { useRouter } from "next/router";
import { useState } from "react";
import NavLinks from "../helpers/NavLinks";
import Header from "./Header";
import Breadcrumbs from "./Breadcrumbs";
import Sidebar from "./Sidebar";

const logoStyle = {
  display: "inline-block",
  font: "20px Helvetica,Arial,Verdana,Sans-Serif",
  fontWeight: "bold",
  margin: "20",
  padding: "20",
  color: "#333",
};

const LecturerLayout = (props) => {
  const appTitle = `quickStudy`;
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);

  // Fetch this list of user's permitted urls from backend
  const fetchedPermissions = [
    { href: "/lecturer", label: "Home", iconClass: "pg-home" },
    { href: "/lecturer/view", label: "My Profile", iconClass: "fa fa-user" },
    {
      href: "/lecturer/announcement",
      label: "Announcements",
      iconClass: "fa fa-envelope",
    },
    {
      href: "/lecturer/my-courses",
      label: "My Courses",
      iconClass: "fa fa-book",
    },
    { href: "/lms", label: "LMS Dashboard", iconClass: "fa fa-briefcase" },
    {
      href: "/lecturer/school-calendar",
      label: "School Calendar",
      iconClass: "fa fa-calendar",
    },
    {
      href: "/lecturer/faq",
      label: "Help & Support",
      iconClass: "fa fa-question",
    },

    { href: "/signin?logout=1", label: "Logout", iconClass: "fa fa-sign-out" },
  ];

  const myLinks = fetchedPermissions;

  return (
    <div className={`${navOpen ? "set-nav-open" : ""}`}>
      <Head>
        <meta httpEquiv="content-type" content="text/html;charset=UTF-8" />
        <meta charSet="utf-8" />
        <title>{`${appTitle}${
          props.pageTitle ? " :: " + props.pageTitle : ""
        }`}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no"
        />
        <link rel="apple-touch-icon" href="/pages/ico/60.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/pages/ico/76.png" />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/pages/ico/120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/pages/ico/152.png"
        />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta content="" name="description" />
        <meta content="" name="author" />
        <link
          href="/assets/plugins/pace/pace-theme-flash.css"
          rel="stylesheet"
          type="text/css"
        />
        <link
          href="/assets/plugins/bootstrap3-wysihtml5/bootstrap3-wysihtml5.min.css"
          rel="stylesheet"
          type="text/css"
        />
        <link
          href="/assets/plugins/jquery-menuclipper/jquery.menuclipper.css"
          rel="stylesheet"
          type="text/css"
        />
        <link
          href="/assets/plugins/bootstrap-tag/bootstrap-tagsinput.css"
          rel="stylesheet"
          type="text/css"
        />
        <link
          href="/assets/plugins/bootstrap/css/bootstrap.min.css"
          rel="stylesheet"
          type="text/css"
        />
        <link
          href="/assets/plugins/font-awesome/css/font-awesome.css"
          rel="stylesheet"
          type="text/css"
        />
        <link
          href="/assets/plugins/jquery-scrollbar/jquery.scrollbar.css"
          rel="stylesheet"
          type="text/css"
          media="screen"
        />
        <link
          href="/assets/plugins/select2/css/select2.min.css"
          rel="stylesheet"
          type="text/css"
          media="screen"
        />
        <link
          href="/assets/plugins/switchery/css/switchery.min.css"
          rel="stylesheet"
          type="text/css"
          media="screen"
        />
        <link
          href="/pages/css/pages-icons.css"
          rel="stylesheet"
          type="text/css"
        />
        <link
          className="main-stylesheet"
          href="/pages/css/pages.css"
          rel="stylesheet"
          type="text/css"
        />
        <link
          className="main-stylesheet"
          href="/custom/css/style.css"
          rel="stylesheet"
          type="text/css"
        />
      </Head>
      <Sidebar
        pagePath={router.pathname}
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
        {props.breadcrumb === true ? (
          <div className="jumbotron " style={{ marginBottom: "0" }}>
            <div className="container-fluid container-fixed-lg sm-p-l-0 sm-p-r-0">
              <Breadcrumbs
                pagePath={router.pathname}
                pageTitle={props.pageTitle}
              />
            </div>
          </div>
        ) : (
          ""
        )}

        <div className="card card-transparent">
          <div
            className="card-body"
            style={{ backgroundColor: `${props.color}` }}
          >
            {props.children}
          </div>
        </div>
      </div>
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
          border-bottom: 1px solid rgba(0, 0, 0, 0.125) !important;
          padding: 0.75rem 1.25rem !important;
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
          color: #788195 !important;
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
  );
};
LecturerLayout.defaultProps = {
  breadcrumb: true,
};
export default LecturerLayout;
