import React from "react";
const CreateButton = React.forwardRef(({ open, ...props }, ref) => (
  <button
    className="btn btn-default btn-cons btn-sm m-b-10"
    type="button"
    style={{ borderColor: "#aaa" }}
    ref={ref}
    {...props}
  >
    <i className="fa fa-plus"></i>{" "}
    <span className="bold">{props.title || "Add New"}</span>
  </button>
));

export default CreateButton;
