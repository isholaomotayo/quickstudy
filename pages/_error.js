function Error() {
  return (
    <div>
      <div id="notfound">
        <div className="notfound">
          <div className="notfound-404">
            <h3>Oops! Page not found</h3>
            <h1>
              <span>4</span>
              <span>0</span>
              <span>4</span>
            </h1>
          </div>
          <h2>
            we are sorry, but the page you requested could not be loaded. This
            may be because your user session has expired
          </h2>

          <div className="button_cont" align="center">
            <a className="button" href="/login" rel="nofollow noopener">
              Click here to continue
            </a>
          </div>
        </div>
      </div>
      <style jsx>
        {`
          * {
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
          }
          body {
            padding: 0;
            margin: 0;
          }
          #notfound {
            position: relative;
            height: 100vh;
          }
          #notfound .notfound {
            position: absolute;
            left: 50%;
            top: 50%;
            -webkit-transform: translate(-50%, -50%);
            -ms-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
          }
          .notfound {
            max-width: 520px;
            width: 100%;
            line-height: 1.4;
            text-align: center;
          }
          .notfound .notfound-404 {
            position: relative;
            height: 240px;
          }
          .notfound .notfound-404 h1 {
            font-family: montserrat, sans-serif;
            position: absolute;
            left: 50%;
            top: 50%;
            -webkit-transform: translate(-50%, -50%);
            -ms-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
            font-size: 252px;
            font-weight: 900;
            margin: 0;
            color: #262626;
            text-transform: uppercase;
            letter-spacing: -40px;
            margin-left: -20px;
          }
          .notfound .notfound-404 h1 > span {
            text-shadow: -8px 0 0 #fff;
          }
          .notfound .notfound-404 h3 {
            font-family: cabin, sans-serif;
            position: relative;
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            color: #262626;
            margin: 0;
            letter-spacing: 3px;
            padding-left: 6px;
          }
          .notfound h2 {
            font-family: cabin, sans-serif;
            font-size: 20px;
            font-weight: 400;
            text-transform: uppercase;
            color: #000;
            margin-top: 0;
            margin-bottom: 25px;
          }
          @media only screen and (max-width: 767px) {
            .notfound .notfound-404 {
              height: 200px;
            }
            .notfound .notfound-404 h1 {
              font-size: 200px;
            }
          }
          @media only screen and (max-width: 480px) {
            .notfound .notfound-404 {
              height: 162px;
            }
            .notfound .notfound-404 h1 {
              font-size: 162px;
              height: 150px;
              line-height: 162px;
            }
            .notfound h2 {
              font-size: 16px;
            }
          }
          .button {
            text-decoration: none;
            font-family: "Verdana";
            font-size: 14px;
            border: none;
            background: #404040;
            color: #ffffff !important;
            font-weight: 100;
            padding: 20px;
            text-transform: uppercase;
            border-radius: 6px;
            display: inline-block;
            transition: all 0.3s ease 0s;
          }

          .button:hover {
            color: #404040 !important;
            font-weight: 700 !important;
            letter-spacing: 3px;
            background: none;
            -webkit-box-shadow: 0px 5px 40px -10px rgba(0, 0, 0, 0.57);
            -moz-box-shadow: 0px 5px 40px -10px rgba(0, 0, 0, 0.57);
            transition: all 0.3s ease 0s;
          }
        `}
      </style>
    </div>
  );
}

export default Error;
