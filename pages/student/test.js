import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import ReactToPrint to avoid SSR issues
const ReactToPrint = dynamic(() => import("react-to-print"), {
  ssr: false,
  loading: () => (
    <button className="btn btn-complete" disabled>
      Loading...
    </button>
  ),
});

const IDCardComponent = (props) => {
  const componentRef = useRef();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <div id="bg" ref={componentRef}>
        <img
          src="https://res.cloudinary.com/emergingplatforms/image/upload/v1599659101/ilearn/imx77tvx5wzp1vnd7kto.png"
          alt=""
        />
      </div>

      {isClient && (
        <ReactToPrint
          trigger={() => {
            return <button className="btn btn-complete">Download</button>;
          }}
          content={() => componentRef.current}
        />
      )}

      <style jsx global>
        {`
          .pls {
            background: url(https://res.cloudinary.com/emergingplatforms/image/upload/v1599659101/ilearn/imx77tvx5wzp1vnd7kto.png)
              no-repeat center center fixed;
            -webkit-background-size: cover;
            -moz-background-size: cover;
            -o-background-size: cover;
            background-size: cover;
          }
          .modal-wee {
            width: 80vw !important;
            margin-left: 30px;
            margin: 20px auto !important;
          }
          #bg {
            position: fixed;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
          }
          #bg img {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            margin: auto;
            min-width: 25%;
            min-height: 25%;
          }
        `}
      </style>
    </>
  );
};

export default IDCardComponent;
