import React from "react";
import Link from "next/link";
const lesson = [
  {
    id: 0,
    title: "What is computer science"
  },
  {
    id: 1,
    title: "Is computer science important"
  },
  {
    id: 3,
    title: "Dangers of not knowing comuter science"
  }
];

const Curriculums = props => {
  return (
    <div className="col-lg-6">
      <div>
        <div className="row">
          <div className="col  justify-content-center float-none">
            <h2>Curriculums</h2>
            {props.modules.map(moduless => {
              return (
                <div
                  className="tabs "
                  key={moduless.id}
                  style={{ width: "200%" }}
                >
                  <div className="tab">
                    <input type="checkbox" id={moduless.id} />
                    <label className="tab-label" htmlFor={moduless.id}>
                      {moduless.name}{" "}
                      <Link href={`/course-module?course_id=${moduless.id}`} legacyBehavior>
                        <a className="btn btn-success">Launch</a>
                      </Link>
                    </label>
                    <div className="tab-content">{moduless.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>
        {`
          body {
            color: #2c3e50;
            background: #ecf0f1;
            padding: 0 1em 1em;
          }
          h1 {
            margin: 0;
            line-height: 2;
          }
          h2 {
            margin: 0 0 0.5em;
            font-weight: normal;
          }
          input {
            position: absolute;
            opacity: 0;
            z-index: -1;
          }
          .row {
            display: flex;
          }
          .row .col {
            flex: 1;
          }
          .row .col:last-child {
          }
          /* Accordion styles */
          .tabs {
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 4px -2px rgba(0, 0, 0, 0.5);
          }
          .tab {
            width: 100%;
            color: white;
            overflow: hidden;
          }
          .tab-label {
            display: flex;
            justify-content: space-between;
            padding: 1em;
            background: #2c3e50;
            font-weight: bold;
            cursor: pointer;
            /* Icon */
          }
          .tab-label:hover {
            background: #1a252f;
          }
          .tab-label::after {
            width: 1em;
            height: 1em;
            transition: all 0.35s;
          }
          .tab-content {
            max-height: 0;
            padding: 0 1em;
            color: #2c3e50;
            background: white;
            transition: all 0.35s;
          }
          .tab-close {
            display: flex;
            justify-content: flex-end;
            padding: 1em;
            font-size: 0.75em;
            background: #2c3e50;
            cursor: pointer;
          }
          .tab-close:hover {
            background: #1a252f;
          }
          input:checked + .tab-label {
            background: #1a252f;
          }
          input:checked + .tab-label::after {
            transform: rotate(90deg);
          }
          input:checked ~ .tab-content {
            max-height: 100vh;
            padding: 1em;
          }
        `}
      </style>
    </div>
  );
};

export default Curriculums;
