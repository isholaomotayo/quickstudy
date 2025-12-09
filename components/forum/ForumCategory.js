import React from "react";
import Pagination from "../Pagination";
import CategoryComponent from "./CategoryComponent";
const ForumCategory = props => {
  return (
    <>
      <div className="container pull-ups">
        <div className="row">
          <div className="col-md-12 m-b-30">
            <div className="card carde">
              <div className="card-header border-bottom">
                <div className="row text-muted  no-gutters align-items-center">
                  <div className="col ">Top Topics</div>
                  <div className="col-4  d-md-block text-muted">
                    <div className="row no-gutters align-items-center">
                      {/* <div className="col-4">Threads</div> */}
                      <div className="col-8 text-center">Actions</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="container-fluid cf">
                {props.categories
                  .sort((a, b) => b.id - a.id)
                  .map(category => {
                    return (
                      <CategoryComponent
                        key={category.id}
                        category={category}
                        handleCategoryEdit={props.handleCategoryEdit}
                        handleEditChange={props.handleEditChange}
                        singleCategory={props.singleCategory}
                        handleCategoryUpdate={props.handleCategoryUpdate}
                        handleCategoryDelete={props.handleCategoryDelete}
                        role={props.role}
                      />
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
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
    </>
  );
};
export default ForumCategory;
