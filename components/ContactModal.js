import { useState } from "react";
import Popup from "reactjs-popup";
import toast from "react-hot-toast";

const ContactModal = (props) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const user = {
    ...props.user,
  };

  const data = {
    ...user,
    subject,
    message,
  };

  const sendSupport = async (data) => {
    let support;
    try {
      support = await fetch(`${process.env.API_URL}/api/support`, {
        method: "post",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          ...data,
        }),
      });

      support = support.status === 200 ? await support.json() : "";
    } catch (e) {
      // console.log(e);
    }

    // console.log(support);
  };
  return (
    <Popup
      trigger={
        <button id="show-modal" className="btn btn-primary  btn-cons">
          <i className="fa fa-plus" /> Contact Support
        </button>
      }
      modal
    >
      {(close) => (
        <div className="modals modal-lg">
          <a className="close" onClick={close}>
            &times;
          </a>
          <div className="modal-header"> Contact Support </div>
          <div className="modals-content">
            <div>
              {/* START card */}
              <div className="card card-default">
                <div className="card-header ">
                  <p>
                    <i className="fa fa-phone"></i>&nbsp;Phone:
                    {props.institution.phone}
                  </p>
                  <p>
                    <i className="fa fa-envelope"></i>&nbsp;Email:
                    {props.institution.support_mail}
                  </p>
                </div>
                <div className="card-body">
                  <form role="form">
                    <div className="form-group">
                      <label>Subject</label>
                      <span className="help"> </span>
                      <input
                        type="text"
                        className="form-control"
                        required
                        name="subject"
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Message</label>
                      <textarea
                        className="form-control"
                        rows="9"
                        name="message"
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                  </form>
                </div>
              </div>
              {/* END card */}
            </div>
          </div>
          <div className="col-md-9">
            <button
              className="btn btn-success"
              form="form1"
              value="Submit"
              onClick={async () => {
                await sendSupport(data);
                toast.success(
                  "Thank you for reaching out to Support, you will receive a response to your message within the hour",
                  { icon: "✅" }
                );
                close();
              }}
            >
              Send
            </button>
            <button
              className="btn btn-default"
              onClick={() => {
                close();
              }}
            >
              <i className="pg-close"></i>
              Cancel
            </button>
          </div>
        </div>
      )}
    </Popup>
  );
};

export default ContactModal;
