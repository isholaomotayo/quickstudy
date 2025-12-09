import React from 'react'
import Curriculums from './curriculums'
import Announcement from './announcement'

const Detailwrapper = () => {
    return (
        <>
          {/* START JUMBOTRON */}
          <div className="jumbotron" data-social="cover" data-pages="parallax">
          <div className="cover-photo">
            <img alt="Cover photo" src="https://natgeo.imgix.net/factsheets/thumbnails/01-balance-of-nature.adapt.jpg?auto=compress,format&w=1600&h=900&fit=crop" />
          </div>
          <div className=" container-fluid   container-fixed-lg sm-p-l-0 sm-p-r-0">
            <div className="inner">
              <div className="pull-bottom bottom-left m-b-40 sm-p-l-15">
                <h5 className="text-white no-margin">welcome to pages social</h5>
                <h1 className="text-white no-margin"><span className="semi-bold">social</span> cover</h1>
              </div>
            </div>
          </div>
        </div>
        {/* END JUMBOTRON */}
        <div className=" container-fluid   container-fixed-lg sm-p-l-0 sm-p-r-0">
          <div className="feed">
            {/* START DAY */}
            <div className="day" data-social="day">
              {/* START ITEM */}
              <div className="card no-border bg-transparent full-width" data-social="item">
                {/* START CONTAINER FLUID */}
                <div className="container-fluid p-t-30 p-b-30 ">
                  <div className="row">
                    <div className="col-lg-4">
                      <div className="container-xs-height">
                        <div className="row-xs-height">
                          <div className="social-user-profile col-xs-height text-center col-top">
                            <div className="thumbnail-wrapper d48 circular bordered b-white">
                              <img alt="Avatar" width={55} height={55} data-src-retina="assets/img/profiles/avatar_small2x.jpg" data-src="assets/img/profiles/avatar.jpg" src="https://www.cheatsheet.com/wp-content/uploads/2019/04/Planet-Earth.jpg" />
                            </div>
                            <br />
                            <i className="fa fa-check-circle text-success fs-16 m-t-10" />
                          </div>
                          <div className="col-xs-height p-l-20">
                            <h3 className="no-margin p-b-5">David Nester</h3>
                            <p className="no-margin fs-16">is excited about the new pages design framework
                            </p>
                            <p className="hint-text m-t-5 small">San Fransisco Bay | CEO at Pages.inc
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <p className="no-margin fs-16">Hi My Name is David Nester, &amp; heres my new pages user profile page</p>
                      <p className="hint-text m-t-5 small">I love reading people's about page especially those who are in the same industry as me.</p>
                    </div>
                    <div className="col-lg-4">
                      <p className="m-b-5 small">1,435 Mutual Friends</p>
                      <ul className="list-unstyled ">
                        <li className="m-r-10">
                          <div className="thumbnail-wrapper d32 circular b-white m-r-5 b-a b-white">
                            <img width={35} height={35} data-src-retina="assets/img/profiles/1x.jpg" data-src="assets/img/profiles/1.jpg" alt="Profile Image" src="https://images.pexels.com/photos/814499/pexels-photo-814499.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" />
                          </div>
                        </li>
                        <li>
                          <div className="thumbnail-wrapper d32 circular b-white m-r-5 b-a b-white">
                            <img width={35} height={35} data-src-retina="assets/img/profiles/2x.jpg" data-src="assets/img/profiles/2.jpg" alt="Profile Image" src="https://www.brinknews.com/wp-content/uploads/2019/09/GettyImages-81794997.jpg" />
                          </div>
                        </li>
                        
                        <li>
                          <div className="thumbnail-wrapper d32 circular b-white">
                            <div className="bg-master text-center text-white"><span>+34</span>
                            </div>
                          </div>
                        </li>
                      </ul>
                      <br />
                      <p className="m-t-5 small">More friends</p>
                    </div>
                  </div>
                </div>
                {/* END CONTAINER FLUID */}
              </div>
              {/* END ITEM */}
              <div className=" container-fluid   ">
              <div className="row">

               <div className='col-sm-12 col0-lg-6'>
               <Curriculums />
               </div>
               <div className='col-sm-12 col0-lg-6'>
               <Announcement />
               </div>
                
                  </div>
              </div>
</div>
          </div>
        </div>
        </>
    )
}

export default Detailwrapper
