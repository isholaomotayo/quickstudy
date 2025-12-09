import { useState } from "react";
import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import DateTimePicker from "react-datetime-picker/dist/entry.nostyle";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import "react-datetime-picker/dist/DateTimePicker.css";
import { dateFormater } from "../helpers/discussion-helpers/discussion-utils";
import toast from "react-hot-toast";

const NewDiscussionTopicModal = (props) => {
  // const [validDate, setValiddate] = useState;
  const [show, setShow] = useState(false);
  const [date1, setdate1] = useState("");
  const [date2, setdate2] = useState("");
  const handleClose = () => setShow(false);

  const handleCreation = (e) => {
    e.preventDefault();

    // console.log(props.dateValidator());

    if (!props.dateValidator()) {
      setdate1("");
      setdate2("");
      toast("You Must Select Correct Dates to create a new discussion", {
        icon: "⚠️",
      });
    } else {
      props.handleCreation();
      setdate1("");
      setdate2("");
      handleClose();
    }
  };
  const handleShow = () => setShow(true);

  const onStartChange = (date) => {
    setdate1(date);
    let dateFull = dateFormater(date);

    if (dateFull === null || dateFull == undefined) {
      dateFull = dateFormater(date);
    }

    props.handleStartDate(dateFull);
  };

  const onEndChange = (date) => {
    setdate2(date);

    let dateFull = dateFormater(date);

    if (dateFull === null || dateFull == undefined) {
      dateFull = dateFormater(date);
    }
    // console.log(new Date(`${dateFull.replace("T", " ")}`));

    props.handleEndDate(dateFull);
  };
  return (
    <>
      <Button
        // style={{ backgroundColor: "#0CCFBD" }}
        className="btn btn-success"
        onClick={handleShow}
      >
        + New Discussion
      </Button>
      <Modal show={show} onHide={handleClose}>
        <form
          role="form"
          onSubmit={(e) => {
            props.dateValidator();
            handleCreation(e);
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>New Discussion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {" "}
            <div>
              {/* START card */}
              <div className="">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label className="text-dark float-left">Title</label>
                        <input
                          required
                          name="title"
                          type="text"
                          className="form-control"
                          onChange={(e) => props.handleChange(e)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="text-dark float-left">Body</label>
                        <textarea
                          required
                          rows="4"
                          name="body"
                          className="form-control"
                          onChange={(e) => props.handleChange(e)}
                        />
                      </div>
                    </div>

                    <div className="col-md-12 mr-5">
                      <div className="form-group mr-5">
                        <label className="text-dark float-left mr-5">
                          Start Date
                        </label>
                        <br />
                        <div>
                          <DateTimePicker
                            required
                            name="start_date"
                            onChange={onStartChange}
                            value={date1}
                            format="y-MM-dd h:mm:ss "
                            secondAriaLabel="Second"
                            nativeInputAriaLabel="Date"
                            calendarIcon="Calendar"
                            clockClassName=""
                            minDate={new Date()}
                            clearIcon={null}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-12 mr-5">
                      <div className="form-group mr-5 ">
                        <label className="text-dark float-left mr-5">
                          End Date
                        </label>
                        <br />
                        <div>
                          <DateTimePicker
                            required
                            name="end_date"
                            onChange={onEndChange}
                            value={date2}
                            format="y-MM-dd h:mm:ss "
                            secondAriaLabel="Second"
                            nativeInputAriaLabel="Date"
                            calendarIcon="Calendar"
                            clockClassName=""
                            minDate={new Date()}
                            clearIcon={null}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* END card */}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary btn-info" onClick={handleClose}>
              Close
            </Button>
            <Button type="submit" className="btn btn-success">
              Save Changes
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
      <style jsx global>
        {`
          . {
            position: absolute;
            background-color: red !important;
            transform: translateX(-50%);
          }

          .react-toast-notifications__container {
            z-index: 1000000 !important;
          }
        `}
      </style>
    </>
  );
};

export default NewDiscussionTopicModal;
