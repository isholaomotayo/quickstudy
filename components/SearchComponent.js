import React, { useState } from "react";
import { useRouter } from "next/router";
import Spinner from "react-bootstrap/Spinner";

const SearchComponent = (props) => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const {
    server = false,
    placeholder = "Start typing",
    searchHandler = () => {},
  } = props;

  const _handleKeyDown = function (e) {
    if (e.key === "Enter") {
      searchHandler(searchValue);
      console.log("do validate");
    }
  };

  return (
    <>
      <div className="col-sm-12 col-md-6">
        <input
          onKeyDown={_handleKeyDown}
          type="text"
          className="form-control"
          placeholder={placeholder}
          onChange={(e) =>
            server ? setSearchValue(e.target.value) : searchHandler(e)
          }
        />
      </div>

      {server && (
        <div className="row">
          <div className="col">
            <button
              className="btn btn-success"
              onClick={async (e) => await searchHandler(searchValue)}
            >
              Search
            </button>
          </div>
          <div className="col">
            <button
              className="btn btn-default text-danger"
              onClick={() => router.reload()}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchComponent;
