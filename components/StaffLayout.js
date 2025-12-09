import Head from "next/head";
import { useRouter } from "next/router";
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

const StaffLayout = (props) => {
  const appTitle = `iLearn`;
  const router = useRouter();
  // Fetch this list of user's permitted urls from backend
  const fetchedPermissions = [
    { href: "/staff", label: "Home", iconClass: "pg-home" },
    { href: "/staff/view", label: "My Profile", iconClass: "fa fa-user" },
    {
      href: "/staff/announcement",
      label: "Announcements",
      iconClass: "fa fa-envelope",
    },
    {
      href: "/staff/school-calendar",
      label: "School Calendar",
      iconClass: "fa fa-calendar",
    },
    {
      href: "/staff/faq",
      label: "Help & Support",
      iconClass: "fa fa-question",
    },
    { href: "/signin?logout=1", label: "Logout", iconClass: "fa fa-sign-out" },
  ];

  const myLinks = fetchedPermissions;

  return (
    <div>
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
      />
      <div className="page-container">
        <Header appTitle={appTitle} logoStyle={logoStyle} />
        {props.breadcrumb === true ? (
          <div className="jumbotron m-b-0">
            <div className="container-fluid container-fixed-lg sm-p-l-0 sm-p-r-0">
              <Breadcrumbs pagePath={router.pathname} />
            </div>
          </div>
        ) : (
          ""
        )}

        <div className="card card-transparent">
          <div className="card-body">{props.children}</div>
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
StaffLayout.defaultProps = {
  breadcrumb: true,
};
export default StaffLayout;
