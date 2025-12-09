import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { Editor } from "@tinymce/tinymce-react";
import { editorInit } from "../../helpers/tinyMCE";
import { TINYMCE_KEY } from "../../constants";

const NewAnnouncementPopup = (props) => {
  const [show, setShow] = useState(false);

  const [validated, setValidated] = useState(false);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      props.handleCreation();
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    setValidated(true);
    event.preventDefault();
    props.handleCreation();
    handleClose();
  };

  const handleClose = () => {
    setTimeout(() => {
      setShow(false);
    }, 1000);
  };

  const handleShow = () => {
    setShow(true);
  };

  return (
    <>
      <Button
        className="btn btn-success"
        onClick={() => {
          handleShow();
        }}
      >
        New Announcement
      </Button>

      <Modal show={show} onHide={handleClose} enforceFocus={false}>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>New Announcement</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                maxLength="200"
                size="20"
                required
                onChange={(e) => props.handleChange(e)}
              />
            </Form.Group>

            <Form.Group controlId="body">
              <Form.Label>Body</Form.Label>

              <Editor
                apiKey={TINYMCE_KEY}
                disabled={false}
                init={editorInit(400, false)} // (editorHeight (int), readonly (boolean)) - readonly is true or false
                textareaName={"body"}
                initialValue={""}
                onChange={props.handleEditorChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary btn-info" onClick={handleClose}>
              Close
            </Button>
            <Button className="btn btn-success" type="submit">
              Create
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default NewAnnouncementPopup;
