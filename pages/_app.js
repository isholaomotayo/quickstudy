import App from "next/app";
import NProgress from "nprogress";
import Router from "next/router";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "@/contexts/AppContext";

import "../public/style.css";
import "nprogress/nprogress.css";

Router.events.on("routeChangeStart", (url) => {
  NProgress.start();
});
Router.events.on("routeChangeComplete", (url) => {
  NProgress.done();
});
Router.events.on("routeChangeError", () => NProgress.done());

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <AppProvider>
        <Component {...pageProps}></Component>
        <Toaster />
      </AppProvider>
    );
  }
}

export default MyApp;
