import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, Form, Button, InputGroup } from "react-bootstrap";
import TinyMCEEditor from "../components/ui/tinyEditor/TinyMCEEditor";
import { getFieldTypeFromValue, getTableSchema, ucfirst } from "./utils";

const API_URL = process.env.API_URL;

const DBForm = (props) => {
  /**
   * DBForm Component
   *
   * props items:
   * @param {object} rowData // (Required) One row (keys and values) from database
   * @param {string} tableName // (Required) Table to read/update. Also assumed to be endpoint name.
   * @param {list} formFields // (Optional) Restricts form fields to this list (shows all if omitted)
   * @param {list} hiddenFields // (Optional) Any fields you want hidden. Note: By default, "id" and some "*_id" fields are already auto hidden
   * @param {list} readonlyFields // (Optional) Any fields you want to be read only.
   * @param {list} disabledFields // (Optional) Any fields you want to be disabled.
   * @param {string} postTo // (Optional) If POST path is not "/api/tablename", enter it here.
   * @param {function} setTableRow // (Optional) update table component with this row.
   * @param {function} afterSuccess // (Optional) call this after posting (on success).
   * @param {object} preloads // (Optional) keys and values of any fields that should be pre-filled
   * @param {list} writeAccess // (Optional) list of user roles that can write and post, if undefined anyone can do so
   * @param {object} userData // (Optional) userData of currently logged-in user, used for read/write access control
   */

  const router = useRouter();
  const rowData = props.rowData || {};
  const readonlyFields = props.readonlyFields || [];
  const infoFields = props.infoFields || [];
  const noUpdateFields = props.noUpdateFields || [];
  const hiddenFields = ["id", ...(props.hiddenFields || [])];
  const disabledFields = [
    "created_at",
    "updated_at",
    "created_by",
    "updated_by",
    ...(props.disabledFields || []),
  ];
  const authorOnlyFields = [
    "created_at",
    "updated_at",
    "created_by",
    "updated_by",
    ...(props.authorOnlyFields || []),
  ];
  const isNewForm = Object.keys(rowData).length === 0;
  const chosenFields = [];
  const postData = {};
  let formFields = props.formFields || [];

  const [formSchema, setformSchema] = useState(props.formSchema || {});
  const [formState, setformState] = useState({ ...rowData });
  const [validated, setValidated] = useState(false);

  const myData = props.userData;
  const writeAccess = props.writeAccess;
  const iCanWrite =
    typeof writeAccess == "undefined" || writeAccess.indexOf(myData.role) > -1;

  // Runs once, only on initial Form load
  useEffect(() => {
    if (Object.keys(formSchema).length === 0) {
      getTableSchema(props.tableName, setformSchema);
    }
  }, []);

  if (formSchema) {
    // Show all fields (from DB formSchema) if formFields not specified in props
    const tableCols = Object.keys(formSchema);
    if (formFields.length) {
      tableCols.forEach((tableCol) => {
        if (
          tableCol.slice(-3) == "_id" &&
          formFields.indexOf(tableCol) < 0 &&
          !props.noAutoIDs
        ) {
          formFields.unshift(tableCol);
        }
      });
    } else formFields = tableCols;
  }

  const handleFieldChange = (e) => {
    let fieldID = e.target.name,
      fieldVal = e.target.value;

    if (e.target.type && e.target.type === "checkbox") {
      fieldVal = e.target.checked;
    } else if (e.target.type && e.target.type === "file") {
      fieldVal = e.target.files && e.target.files[0];
    } else if ("targetElm" in e.target) {
      fieldID = e.target.targetElm.name;
      fieldVal = e.target.getContent();
    }

    if (e.target.dataset && e.target.dataset.statepath) {
      let stateStructure = e.target.dataset.statepath.split("__");

      fieldID = stateStructure[0];
      if (!formState[fieldID]) formState[fieldID] = {};
      fieldVal = formState[fieldID];

      if (!fieldVal[stateStructure[1]]) fieldVal[stateStructure[1]] = {};
      fieldVal[stateStructure[1]][stateStructure[2]] =
        e.target.type == "checkbox" ? e.target.checked : e.target.value;
    }

    setformState({
      ...formState,
      [fieldID]: fieldVal,
    });
  };

  const handleSubmit = async (event) => {
    const form = event.currentTarget;

    event.preventDefault();

    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // Submit to endpoint for the tablename
      const saveMethod = isNewForm ? "POST" : "PUT";
      const endpoint =
        API_URL +
        (props.postTo ||
          `/api/${props.tableName.replace("_", "")}${
            isNewForm ? "" : "/" + rowData.id
          }`);
      if (isNewForm) delete postData["id"];
      //console.log(formState, postData)
      const response = await fetch(endpoint, {
        method: saveMethod,
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        credentials: "include",
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const result = await response.json();

        if (props.setTableRow) {
          props.setTableRow(result, isNewForm);
        }

        if (props.afterSuccess) {
          let afterSuccess = props.afterSuccess;

          if (!Array.isArray(afterSuccess)) afterSuccess = [afterSuccess];
          afterSuccess.forEach((fxn) => fxn());
        }

        if (props.setRelatedManagers) {
          const [relatedPropertyName, setRelated] = props.setRelatedManagers;
          const relatedItem = result[relatedPropertyName];

          if (relatedItem) setRelated(relatedItem);
        }
      }
    }

    setValidated(true);
  };

  return (
    <Card className="text-left">
      {props.title ? <Card.Header>{props.title}</Card.Header> : ""}
      <Card.Body>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          {formFields.forEach((fieldName, i) => {
            // if (fieldName.length > 8 && fieldName.slice(-8) == "__prefab") {
            //     //console.log('>>>>>>>>>', rowData[fieldName])
            //     chosenFields.push(rowData[fieldName])
            //     return
            // }

            const schemaField = formSchema && formSchema[fieldName],
              tableColType = schemaField && schemaField["type"];

            if (
              !tableColType ||
              (!iCanWrite && authorOnlyFields.indexOf(fieldName) > -1)
            )
              return;

            let fieldValue = rowData[fieldName],
              fieldLabel = fieldName.replace(/_/g, " "),
              fieldType =
                getFieldTypeFromSchema(tableColType) ||
                getFieldTypeFromValue(fieldValue),
              fieldAs =
                (props.selectFields &&
                  fieldName in props.selectFields &&
                  "select") ||
                getFieldAsFromSchema(tableColType) ||
                "input",
              tableColDefault = schemaField["defaultValue"],
              isForeignKey = fieldName.slice(-3) == "_id",
              isParentField =
                isForeignKey &&
                (fieldName in router.query ||
                  (props.preloads && fieldName in props.preloads)),
              foreignKeyTableName =
                (isForeignKey && fieldName.substr(0, fieldName.length - 3)) ||
                "",
              isEmbeddedParentField =
                !isParentField && foreignKeyTableName == props.tableName,
              isRequired =
                !schemaField["nullable"] && tableColType != "boolean",
              isNoUpdateField = noUpdateFields.indexOf(fieldName) > -1,
              isDisabled =
                disabledFields.indexOf(fieldName) > -1 ||
                (isNoUpdateField && fieldValue),
              isReadOnly = readonlyFields.indexOf(fieldName) > -1,
              isHidden =
                isParentField ||
                hiddenFields.indexOf(fieldName) > -1 ||
                isEmbeddedParentField,
              isTemplateJSONField =
                tableColType == "json" &&
                props.jsonFields &&
                fieldName in props.jsonFields,
              isInfoField = infoFields.indexOf(fieldName) > -1,
              isDropDown =
                fieldAs == "select" &&
                props.selectFields &&
                fieldName in props.selectFields;

            if (isDropDown && fieldLabel.slice(-3) == " id")
              fieldLabel = fieldLabel.slice(0, -3);

            if (isNewForm) {
              // Show only editable fields for new/create forms
              if (isDisabled || isReadOnly || fieldName == "id") return;

              if (isParentField)
                fieldValue =
                  router.query[fieldName] ||
                  (props.preloads && props.preloads[fieldName]);
              if (isEmbeddedParentField) fieldValue = router.query["id"];

              if (fieldName == "order" && fieldType == "number") {
                formState[fieldName] = (props.numTableRows || 0) + 1;
                fieldValue = formState[fieldName];
              }
            }

            // Format datetime string to HTML specs
            if (fieldType == "datetime-local" && fieldValue) {
              formState[fieldName] = cleanDatetimeString(formState[fieldName]);
              fieldValue = formState[fieldName];
            }

            // Use DB default value when necessary
            if (
              tableColDefault &&
              tableColDefault.indexOf("::") < 0 &&
              typeof formState[fieldName] == "undefined"
            ) {
              if (tableColType == "boolean")
                tableColDefault = tableColDefault === "true";
              setformState({
                ...formState,
                [fieldName]: tableColDefault,
              });
              fieldValue = formState[fieldName];
            }

            // Copy field from formState to POST object, if qualified
            if (!isDisabled)
              postData[fieldName] = formState[fieldName] || fieldValue || "";
            if (tableColType == "boolean")
              postData[fieldName] = formState[fieldName];
            if (isTemplateJSONField) {
              postData[fieldName] = {};
            }

            chosenFields.push(
              isHidden ? (
                <Form.Control
                  key={`field${i}`}
                  name={fieldName}
                  type="hidden"
                  value={fieldValue}
                />
              ) : (
                <Form.Group
                  controlId={`field${i}`}
                  className={`form-group-default ${
                    isRequired && iCanWrite ? "required" : ""
                  } 
                                        ${
                                          !iCanWrite && !isDisabled
                                            ? "nowrite"
                                            : ""
                                        }`}
                  key={`field${i}`}
                >
                  {tableColType == "boolean" ? (
                    <Form.Check
                      type="switch"
                      name={fieldName}
                      label={fieldLabel}
                      required={isRequired}
                      checked={formState[fieldName]}
                      disabled={isDisabled || !iCanWrite}
                      onChange={iCanWrite ? handleFieldChange : null}
                    />
                  ) : (
                    <>
                      <Form.Label>{fieldLabel}</Form.Label>
                      {fieldAs == "textarea" &&
                      props.editorField &&
                      fieldName == props.editorField ? (
                        <TinyMCEEditor
                          key={`editor-${fieldName}-${rowData.id || "new"}`}
                          value={formState[fieldName] || ""}
                          onChange={(content) => {
                            if (iCanWrite) {
                              handleFieldChange({
                                target: {
                                  name: fieldName,
                                  value: content,
                                },
                              });
                            }
                          }}
                          height={props.editorHeight || 500}
                          readonly={isDisabled || !iCanWrite}
                          placeholder={`Enter ${fieldLabel.toLowerCase()}...`}
                        />
                      ) : isTemplateJSONField ? (
                        //Array.isArray(formState[fieldName])
                        jsonToField(fieldName, isDisabled, isInfoField)
                      ) : (
                        <Form.Control
                          bsPrefix={`form-control${
                            fieldAs == "textarea" ? " free-height" : ""
                          }`}
                          name={fieldName}
                          type={fieldType}
                          value={
                            (isDisabled || isReadOnly
                              ? fieldValue
                              : formState[fieldName]) || ""
                          }
                          required={isRequired}
                          as={fieldAs}
                          readOnly={isReadOnly}
                          disabled={isDisabled || !iCanWrite}
                          rows={fieldAs == "textarea" ? 5 : null}
                          onChange={iCanWrite ? handleFieldChange : null}
                          min={
                            fieldType == "number" && !props.allowNegative
                              ? 0
                              : null
                          }
                        >
                          {isDropDown ? (
                            <>
                              <option value=""> --------------- </option>
                              {props.selectFields[fieldName].map(
                                (selectField, i) => {
                                  let [selectValue, selectTitle] = [
                                    selectField,
                                    selectField,
                                  ];

                                  if (Array.isArray(selectField)) {
                                    [selectValue, selectTitle] = selectField;
                                  }

                                  return (
                                    <option
                                      key={`${fieldName}-option-${i}`}
                                      value={selectValue}
                                    >
                                      {ucfirst(selectTitle)}
                                    </option>
                                  );
                                }
                              )}
                            </>
                          ) : null}
                        </Form.Control>
                      )}
                      <Form.Control.Feedback type="invalid">
                        Please enter a proper {fieldName}.
                      </Form.Control.Feedback>
                    </>
                  )}
                </Form.Group>
              )
            );
          })}
          {chosenFields}
          {iCanWrite ? (
            <Button variant="success" type="submit">
              Save
            </Button>
          ) : (
            ""
          )}
          <style jsx global>{`
            .free-height {
              height: auto !important;
            }
            // .nowrite.form-group-default {
            //     border: none !important;
            // }
            .nowrite .form-control[disabled] {
              color: #000 !important;
            }
            .json.form-control {
              margin-top: 0 !important;
              border-top: 1px solid #ced4da !important;
              border-bottom: 1px solid #ced4da !important;
              padding-left: 5px !important;
            }
          `}</style>
        </Form>
      </Card.Body>
    </Card>
  );

  function jsonToField(fieldName, isDisabled, isInfoField) {
    return Object.entries(props.jsonFields[fieldName]).map(
      ([key, optionFormat]) => (
        <InputGroup className="mb-1" key={`${fieldName}-${key}`}>
          <InputGroup.Prepend>
            <InputGroup.Text id={`${fieldName}_${key}_keytext`}>
              {key}
            </InputGroup.Text>
          </InputGroup.Prepend>
          {Object.entries(optionFormat).map(
            ([subFieldName, subFieldDefault]) => {
              let subFieldID = `${fieldName}__${key}__${subFieldName}`,
                subFieldType = typeof subFieldDefault,
                subFieldStateValue =
                  formState[fieldName] &&
                  formState[fieldName][key] &&
                  formState[fieldName][key][subFieldName],
                statePath = `${fieldName}__${key}__${subFieldName}`;

              if (!postData[fieldName][key]) postData[fieldName][key] = {};
              postData[fieldName][key][subFieldName] =
                subFieldStateValue || subFieldDefault;

              //postData[subFieldID] = formState[subFieldID]
              return subFieldType == "boolean" ? (
                isInfoField ? (
                  <InputGroup.Text key={`${subFieldID}-key`}>
                    {subFieldStateValue ? (
                      <i className="fa fa-plus-circle" />
                    ) : (
                      ""
                    )}
                  </InputGroup.Text>
                ) : (
                  <InputGroup.Checkbox
                    key={`${subFieldID}-key`}
                    aria-label=""
                    name={subFieldID}
                    data-statepath={statePath}
                    checked={subFieldStateValue ? true : false}
                    disabled={isDisabled || !iCanWrite}
                    onChange={iCanWrite ? handleFieldChange : null}
                  />
                )
              ) : (
                <Form.Control
                  key={`${subFieldID}-key`}
                  aria-label=""
                  name={subFieldID}
                  aria-describedby={`${fieldName}_${key}_keytext`}
                  data-statepath={statePath}
                  className="json free-height"
                  value={subFieldStateValue}
                  disabled={isDisabled || !iCanWrite}
                  onChange={iCanWrite ? handleFieldChange : null}
                />
              );
            }
          )}
        </InputGroup>
      )
    );
  }
};

function getFieldTypeFromSchema(colType) {
  let fieldType = "text";

  if ("integer,bigint,float,decimal".indexOf(colType) > -1)
    fieldType = "number";
  else if (colType == "date") fieldType = "date";
  else if (colType == "datetime" || colType.indexOf("timestamp") > -1)
    fieldType = "datetime-local";
  else if (colType == "time") fieldType = "time";

  return fieldType;
}

function getFieldAsFromSchema(colType) {
  let fieldAs = "input";

  if ("enu,enum".indexOf(colType) > -1)
    fieldAs = "select"; // not in schema - workaround above
  else if (colType == "text") fieldAs = "textarea";

  return fieldAs;
}

function cleanDatetimeString(dtString) {
  const realDate = new Date(dtString),
    [y, mo, d, h, m] = [
      realDate.getFullYear(),
      realDate.getMonth() + 1,
      realDate.getDate(),
      realDate.getHours(),
      realDate.getMinutes(),
    ].map((datePart0) => {
      let datePart = String(datePart0);
      return datePart.length < 2 ? "0" + datePart : datePart;
    }),
    newdtString = `${y}-${mo}-${d}T${h}:${m}`;

  return newdtString;
}

export default DBForm;
