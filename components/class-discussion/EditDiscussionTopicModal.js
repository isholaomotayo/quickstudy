import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import DateTimePicker from "react-datetime-picker/dist/entry.nostyle";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import "react-datetime-picker/dist/DateTimePicker.css";
import { dateFormater } from "../../helpers/discussion-helpers/discussion-utils";
import toast from "react-hot-toast";

const EditDiscussionTopicModal = (props) => {
  const [show, setShow] = useState(false);
  const [date1, setdate1] = useState("");
  const [date2, setdate2] = useState("");
  

  const handleClose = () => setShow(false);
  const handleThreadUpdate = () => {
    if (!props.dateValidator()) {
      setdate1("");
      setdate2("");
      toast("You Must Select Correct Dates to create a new discussion ", { icon: "⚠️" });
    } else {
      props.handleThreadUpdate();
      handleClose();
    }
  };
  const handleShow = () => {
    setShow(true);
  };

  const onStartChange = (date) => {
    // console.log(date);

    // console.log("date coming back from baceknd", props.singleTopic.start_date);

    setdate1(date);

    // console.log(date);
    let dateFull = dateFormater(date);
    if (dateFull === null || dateFull == undefined) {
      dateFull = dateFormater(date);
    }

    props.handleStartDate(dateFull);
    // console.log(dateFull);
  };

  const onEndChange = (date) => {
    setdate2(date);

    let dateFull = dateFormater(date);

    if (dateFull === null || dateFull == undefined) {
      dateFull = dateFormater(date);
    }

    props.handleEndDate(dateFull);
  };
  return (
    <>
      <Button
        className="btn btn-warning mr-3 px-4"
        onClick={() => {
          props.handleThreadClick(props.topic.id);
          handleShow();
        }}
      >
        Edit
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Discussion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {" "}
          <div>
            {/* START card */}
            <div className="">
              <div className="card-body">
                <form role="form">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label className="text-dark float-left">Title</label>
                        <input
                          name="title"
                          type="text"
                          className="form-control"
                          value={props.singleTopic.title}
                          onChange={(e) => props.handleChange(e)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="text-dark float-left">Body</label>
                        <textarea
                          rows="4"
                          name="body"
                          className="form-control"
                          value={props.singleTopic.body}
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
                            name="start_date"
                            onChange={onStartChange}
                            value={
                              date1.length == 0
                                ? new Date(
                                    String(
                                      props.singleTopic.start_date
                                    ).replace("T", " ")
                                  )
                                : date1
                            }
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
                    <br />
                    <div className="col-md-12 mr-5">
                      <div className="form-group mr-5 ">
                        <label className="text-dark float-left mr-5">
                          End Date
                        </label>
                        <br />

                        <div>
                          <DateTimePicker
                            name="end_date"
                            onChange={onEndChange}
                            value={
                              date2.length == 0
                                ? new Date(
                                    String(props.singleTopic.end_date).replace(
                                      "T",
                                      " "
                                    )
                                  )
                                : date2
                            }
                            format="y-MM-dd h:mm:ss "
                            secondAriaLabel="Second"
                            nativeInputAriaLabel="Date"
                            calendarIcon="Calendar"
                            clockClassName=""
                            className=""
                            minDate={new Date()}
                            clearIcon={null}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            {/* END card */}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary btn-info" onClick={handleClose}>
            Close
          </Button>
          <Button className="btn btn-success" onClick={handleThreadUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
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

export default EditDiscussionTopicModal;
