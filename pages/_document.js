import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const originalRenderPage = ctx.renderPage;

    // Run the React rendering logic synchronously
    ctx.renderPage = () =>
      originalRenderPage({
        // Useful for wrapping the whole react tree
        enhanceApp: (App) => App,
        // Useful for wrapping in a per-page basis
        enhanceComponent: (Component) => Component,
      });

    // Run the parent `getInitialProps`, it now includes the custom `renderPage`
    const initialProps = await Document.getInitialProps(ctx);

    return initialProps;
  }

  render() {
    return (
      <Html lang="en">
        <Head>
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
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
