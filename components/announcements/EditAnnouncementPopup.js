import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { Editor } from "@tinymce/tinymce-react";
import { editorInit } from "../../helpers/tinyMCE";
import { TINYMCE_KEY } from "../../constants";

const EditAnnouncementPopup = props => {
  const [show, setShow] = useState(false);
  const [validated, setValidated] = useState(false);

  const handleClose = () => setShow(false);

  const handleShow = () => {
    setShow(true);
  };

  const handleSubmit = event => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    setValidated(true);
    event.preventDefault();
    props.handleUpdate(event);
    handleClose();
  };

  return (
    <>
      {Number(props.authUser) === props.userId ? (
        <Button
          className="btn btn-warning mr-3 px-4"
          onClick={() => {
            props.handleClick(props.id);
            handleShow();
          }}
        >
          Edit
        </Button>
      ) : null}

      <Modal show={show} onHide={handleClose} enforceFocus={false}>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Announcement</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={props.singleAnnouncement.title}
                onChange={e => props.handleChange(e)}
                required
                maxLength="200"
                size="20"
              />
            </Form.Group>

            <Form.Group controlId="body">
              <Form.Label>Body</Form.Label>

              <Editor
                apiKey={TINYMCE_KEY}
                disabled={false}
                init={editorInit(400, false)} // (editorHeight (int), readonly (boolean)) - readonly is true or false
                textareaName={"body"}
                initialValue={props.singleAnnouncement.body}
                onChange={props.handleEditorChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary btn-info" onClick={handleClose}>
              Close
            </Button>
            <Button className="btn btn-success" type="submit">
              Update
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default EditAnnouncementPopup;
