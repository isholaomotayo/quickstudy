import React from "react";

const Pagination = props => {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(props.total / props.dataPerPage); i++) {
    pageNumbers.push(i);
  }
  // console.log(pageNumbers);
  return (
    <>
      <div className="col-12 mt-2">
        <nav aria-label="Page navigation example">
          <ul
            className="pagination justify-content-center pld"
            style={{ paddingLeft: "0" }}
          >
            {
            props.handlePreviousPage &&
            <li className="page-item  style={{paddingLeft:'0'}}">
              <a
                className={`${
                  props.color == undefined ? "page-link" : "page-link text-info"
                }`}
                href="#"
                onClick={() => props.handlePreviousPage()}
              >
                Previous
              </a>
            </li>
            }
            {pageNumbers.map(number => {
              let linkID = `page__${number}`
              return (
                <li
                  className="page-item"
                  key={linkID}
                  style={{ paddingLeft: "0" }}
                  id={`li__${linkID}`}
                >
                  <a
                    onClick={
                      props.paginate 
                      ? () => props.paginate(number) 
                      : null
                    }
                    href={
                      props.href 
                      ? `${props.href}${number}` 
                      : "#"
                    }
                    id={`a__${linkID}`}
                    className={`page-link ${
                      props.currentPage === number
                        ? `text-white ${
                            props.color == undefined
                              ? "bg-primary"
                              : props.color
                          }`
                        : ""
                    }`}
                  >
                    {number}
                  </a>
                </li>
              );
            })}
            {
            props.handleNextPage &&
            <li className="page-item" style={{ paddingLeft: "0" }}>
              <a
                className={`${
                  props.color == undefined ? "page-link" : "page-link text-info"
                }`}
                href="#"
                onClick={() => props.handleNextPage(props.total)}
              >
                Next
              </a>
            </li>
            }
          </ul>
        </nav>
      </div>

      <style jsx>
        {`
          .page-link {
            line-height: 1.25;
            position: relative;
            display: block;
            margin-left: -1px;
            padding: 0.5rem 0.75rem;
            color: #6772e5;
            border: 1px solid #e3ebf6;
            background-color: #fff;
          }

          .pld > li,
          ol > li {
            padding-left: 0 !important!;
          }

          .hover-link:hover {
            background-color: #7b6db6;
          }
        `}
      </style>
    </>
  );
};

export default Pagination;
