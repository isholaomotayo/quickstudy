import Link from "next/link";
import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import { toast } from "react-hot-toast";
import DBForm from "../helpers/DBForm";
import { translateCode } from "../helpers/language/translate";
import {
  deleteTableRow,
  getFieldTypeFromValue,
  getTableSchema,
  showToastAlert,
  sortObjectsByNumProperty,
} from "../helpers/utils";
import Modal from "./Modal";

const SuperTable = (props) => {
  /**
   * Super Table Component ;)
   *
   * props items:
   * @param {list} rows // (Required) Database rows
   * @param {string} tableName // (Optional) DB Table to read/update. Also assumed to be endpoint name.
   * @param {list} tableCols // (Optional) Restricts table columns to this list (shows all if omitted)
   * @param {list} formFields // (Optional) Restricts form fields to this list (shows all if omitted)
   * @param {string} itemName // (Optional) Item name used in form, e.g: Add New {itemName}
   * @param {string} subPage // (Optional) The page that link clicks should go to - a child list or detail page, eg: lms/courses or lms/course
   * @param {string} subIsList // (Optional) Is subPage a list? (default: false - i.e. table row links to detail page by default)
   * @param {string} subLinkTitle // (Optional) Title of the link in table
   * @param {boolean} hideDetails // (Optional) If true, hides all link cols & buttons, and turns this into a regular table
   * @param {string} createBtnTitle // (Optional) Add new row button title - default: "+ Add New"
   * @param {string} editBtnTitle // (Optional) Row details button title - default: "Details..."
   * @param {list} hiddenFields // (Optional) Any fields you want hidden. Note: By default, 'id' and '*_id' fields are already auto hidden
   * @param {list} readonlyFields // (Optional) Any fields you want to be read only.
   * @param {string} postTo // (Optional) If POST path is not "/api/tablename", enter it here.
   * @param {list} passToSubPage // (Optional) if you want to pass any row field apart from id to subPage, list them here
   * @param {list} passToForm // (Optional) extra form fields that should be pre-filled from row objects
   * @param {list} writeAccess // (Optional) list of user roles that can create or update rows, if undefined anyone can write
   * @param {object} userData // (Optional) userData of currently logged-in user, used for read/write access control
   */

  const [tableRows, setTableRows] = useState([...props.rows]);
  const [formSchema, setformSchema] = useState(props.formSchema || {});

  const tableHead = [],
    tableCols =
      props.tableCols || (props.rows && Object.keys(props.rows[0])) || [];
  const passToSubPage = props.passToSubPage || [];
  const passToForm = props.passToForm || [];
  const subRef = props.subRef || (props.tableName && props.tableName + "_id");
  const useContextModals = props.useContextModals !== false;

  const myData = props.userData,
    writeAccess = props.writeAccess,
    iCanWrite =
      typeof writeAccess == "undefined" ||
      (myData && writeAccess.indexOf(myData.role) > -1),
    iCanDelete =
      props.deleteAccess &&
      myData &&
      props.deleteAccess.indexOf(myData.role) > -1;

  let pageNotif = "",
    pageNotifClass = "";

  // Runs once, only on initial Table load
  useEffect(() => {
    if (
      Object.keys(formSchema).length === 0 &&
      !props.hideDetails &&
      !props.noForm
    ) {
      getTableSchema(props.tableName, setformSchema);
    }
  }, []);

  const i = 0,
    j = 0,
    k = 0,
    col = "",
    rowItems = [];

  const setRow = (newRowData, isNewRow, isDelete, delItemID) => {
    //console.log(newRowData, isNewRow)
    const orderize =
      newRowData && newRowData.order && typeof newRowData.order == "number";
    let tableRows2 = [];

    if (props.preRowUpdateFxn) {
      newRowData = props.preRowUpdateFxn(newRowData);
    }

    if (isNewRow) {
      // Prepend the new row
      tableRows2 = [newRowData, ...tableRows];
    } else if (isDelete) {
      // Remove row from UI list
      tableRows2 = tableRows.filter((tableRow) => {
        return tableRow.id != delItemID;
      });
    } else {
      // Update the row with given ID
      tableRows2 = tableRows.map((tableRow) => {
        return tableRow.id == newRowData.id ? newRowData : tableRow;
      });
    }

    if (orderize) {
      tableRows2 = sortObjectsByNumProperty(tableRows2, "order");
    }

    setTableRows([...tableRows2]);
  };

  const handleDelete = async (e) => {
    if (confirm(translateCode("confirm_delete_item"))) {
      const itemID = e.target.id.split("_").slice(-1)[0];
      const delData = await deleteTableRow(props.tableName, itemID);

      if (delData && delData.error && delData.message) {
        pageNotif = delData.message;
        pageNotifClass = "error";
      } else {
        setRow(null, false, true, itemID); // Delete from UI
        pageNotif = translateCode("deleted");
        pageNotifClass = "success";
      }

      showToastAlert(pageNotif, pageNotifClass, 6);
    }
  };

  tableHead.push(
    <tr key={`thtr0`}>
      {tableCols.map((col, j) => (
        <th key={`thtr${j}`}>{col.replace("_", " ")}</th>
      ))}
      {!useContextModals && <th key="context-modal">...</th>}
      {props.subPage && <th key="sub-page">...</th>}
      {iCanDelete && <th key="delete">...</th>}
    </tr>
  );

  const tableBody = tableRows.map((row) => getRowElement(row));

  return (
    <>
      {iCanWrite && !(props.hideDetails || props.hideAdd) ? (
        <div className="text-right">
          <Modal
            openBtnTitle={`${props.createBtnTitle || "+ Add New"}`}
            modalTitle={`Add New ${props.itemName || ""}`}
            modalSize="lg"
            openBtnSize={props.openBtnSize || "sm"}
          >
            {(closeModal) => (
              <DBForm
                tableName={props.tableName}
                formSchema={formSchema}
                formFields={props.formFields}
                postTo={props.postTo}
                setTableRow={setRow}
                afterSuccess={closeModal}
                numTableRows={tableRows.length}
                selectFields={props.selectFields}
                noAutoIDs={props.noAutoIDs}
              />
            )}
          </Modal>
        </div>
      ) : (
        ""
      )}
      <div>{props.parent && (props.parent.name || props.parent.name)}</div>
      <Table hover responsive>
        <thead>{tableHead}</thead>
        <tbody>{tableBody}</tbody>
      </Table>
      <style jsx global>{`
        a.del-button:hover {
          cursor: pointer !important;
        }
        .text-danger {
          color: pink !important;
        }
      `}</style>
    </>
  );

  function getRowElement(row) {
    let extraQueryStrings = "",
      preloads = {},
      linkDone = false;

    passToSubPage.forEach((field) => {
      if (field in row) extraQueryStrings += `&${field}=${row[field]}`;
    });

    passToForm.forEach((field) => {
      if (field in row) preloads[field] = row[field];
    });

    return (
      <tr key={`tr${row.id}`}>
        {tableCols.map((col, k) => {
          if (tableCols.indexOf(col) > -1) {
            let fieldType = getFieldTypeFromValue(row[col]),
              colTitle = row[col],
              linkThis =
                useContextModals &&
                "name,title,username,first_name".indexOf(col) > -1 &&
                !linkDone &&
                !props.hideDetails &&
                !props.noForm;

            if (fieldType == "datetime-local") {
              const colDate = new Date(colTitle);
              colTitle = colDate.toLocaleString();
            } else if (typeof colTitle == "boolean")
              colTitle = colTitle.toString();

            if (linkThis) linkDone = true;

            return (
              <td key={`tr${row.id}td${k}`}>
                {linkThis ? getModal(row, colTitle, preloads, true) : colTitle}
              </td>
            );
          }
          return null;
        })}
        {!useContextModals && (
          <td key={`tr${row.id}td-modal`}>
            {getModal(row, "", preloads, true)}
          </td>
        )}
        {props.subPage && (
          <td key={`tr${row.id}td-sub`}>
            <Link
              href={`/${props.subPage}?${subRef}=${row.id}${extraQueryStrings}`}
              legacyBehavior
            >
              <a>{props.subLinkTitle || props.subPage.replace("_", " ")}</a>
            </Link>
          </td>
        )}
        {iCanDelete && (
          <td key={`tr${row.id}td-del`}>
            <a
              id={`item_id_${row.id}`}
              className="del-button text-danger"
              title="Delete"
              onClick={handleDelete}
            >
              <i id={`item_icon_${row.id}`} className="fa fa-times-circle-o" />
            </a>
          </td>
        )}
      </tr>
    );
  }
  function getModal(row, colTitle, preloads, useLink) {
    return (
      <Modal
        openBtnTitle={`${colTitle || "Details..."}`}
        openBtnSize="xs"
        preModalTitle={iCanWrite ? "Edit:" : ""}
        modalTitle={props.itemName || "details"}
        modalSize={props.modalSize || "lg"}
        useLink={useLink}
      >
        <DBForm
          tableName={props.tableName}
          rowData={row}
          formSchema={formSchema}
          formFields={props.formFields}
          selectFields={props.selectFields}
          preloads={preloads}
          postTo={props.postTo}
          readonlyFields={props.readonlyFields}
          hiddenFields={props.hiddenFields}
          disabledFields={props.disabledFields}
          setTableRow={setRow}
          afterSuccess={() => {
            toast.success("Changes saved successfully!");
          }}
          writeAccess={props.writeAccess}
          userData={props.userData}
          jsonFields={props.jsonFields}
          noAutoIDs={props.noAutoIDs}
        />
      </Modal>
    );
  }
};

export default SuperTable;
