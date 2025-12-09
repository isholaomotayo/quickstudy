import React from "react";
import Link from "next/link";
import EditCategoryPopup from "./EditCategoryPopup";
import DeleteCategoryPopup from "./DeleteCategoryPopup";

const CategoryComponent = props => {
  return <>
    {/*single-category*/}
    <div className="row p-t-10 p-b-10  align-items-center border-bottom">
      <div className="col">
        <Link href={`/forum-thread?id=${props.category.id}`} legacyBehavior>
          <a
            href={`/forum-thread?id=${props.category.id}`}
            className="text-big"
          >
            {props.category.name}
          </a>
        </Link>
      </div>
      <div className=" d-md-block col-4">
        <div className="row no-gutters align-items-center">
          {/* <div className="col-4">{props.category.forumTopics.length}</div> */}
          <div className="media col-8 align-items-center">
            <div className="media-body ml-2">
              {props.role === "ADMIN" || props.role === "SUPERADMIN" ? (
                <>
                  <EditCategoryPopup
                    category={props.category}
                    handleCategoryEdit={props.handleCategoryEdit}
                    handleEditChange={props.handleEditChange}
                    singleCategory={props.singleCategory}
                    handleCategoryUpdate={props.handleCategoryUpdate}
                  />
                  <DeleteCategoryPopup
                    id={props.category.id}
                    handleCategoryEdit={props.handleCategoryEdit}
                    handleCategoryDelete={props.handleCategoryDelete}
                  />
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
    {/*end single-category*/}
    <style jsx>
      {`
        .carde {
          border-radius: 0.25rem;
        }
        .pull-ups {
          margin-top: -100px;
        }
        .p-t-60,
        p-b-60 {
          padding-top: 60px;
          padding-bottom: 60px;
        }
        .opacity-75 {
          opacity: 0.75;
        }

        @media (max-width: 767px) {
          .cf {
            padding-left: 30px !important;
            padding-right: 30px !important;
            position: relative !important;
          }
        }

        .avatar .avatar-title {
          font-size: 18px;
        }
        .avatar {
          width: 3rem;
          height: 3rem;
        }
        .avatar-title {
          display: flex;
          width: 100%;
          height: 100%;
          color: #fff;
          background-color: #b1c2d9;
          align-items: center;
          justify-content: center;
        }
        .avatar {
          position: relative;
        }
        .rounded-circle {
          border-radius: 50% !important;
        }
      `}
    </style>
  </>;
};

export default CategoryComponent;
