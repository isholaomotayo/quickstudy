import React from 'react'

const Opened = () => {
    return (
        <div data-email="opened" className="split-details">
    <div className="no-result">
        <h1>No email has been selected</h1>
    </div>
    <div className="email-content-wrapper" style={{display: 'none'}}>
        <div className="actions-wrapper menuclipper bg-master-lightest">
            <ul className="actions menuclipper-menu no-margin p-l-20 ">
                <li className="d-lg-none d-xl-none sm-no-padding">
                    <a href="#" className="split-list-toggle"><i className="fa fa-angle-left" /> All Inboxes</a>
                </li>
                <li className="no-padding "><a href="#" className="text-info">Reply</a>
                </li>
                <li className="no-padding "><a href="#">Reply all</a>
                </li>
                <li className="no-padding "><a href="#">Forward</a>
                </li>
                <li className="no-padding "><a href="#">Mark as read</a>
                </li>
                <li className="no-padding "><a href="#" className="text-danger">Delete</a>
                </li>
            </ul>
            <div className="clearfix" />
        </div>
        <div className="email-content">
            <div className="email-content-header">
                <div className="thumbnail-wrapper d48 circular bordered">
                    <img width={40} height={40}  data-src-retina="assets/img/profiles/avatar2x.jpg" data-src="assets/img/profiles/avatar.jpg" src="https://cosmos-images2.imgix.net/file/spina/photo/20565/191010_nature.jpg?ixlib=rails-2.1.4&auto=format&ch=Width%2CDPR&fit=max&w=835" />
                </div>
                <div className="sender inline m-l-10">
                    <p className="name no-margin bold">
                    </p>
                    <p className="datetime no-margin" />
                </div>
                <div className="clearfix" />
                <div className="subject m-t-20 m-b-20 semi-bold">
                </div>
                <div className="fromto">
                    <div className="pull-left">
                        <div className="btn-group dropdown-default">
                            <a className="btn dropdown-toggle btn-small btn-rounded" data-toggle="dropdown" href="#">
                David Nester
              </a>
                            <div className="dropdown-menu" style={{width: '159.641px'}}>
                                <a className="dropdown-item" href="#">Action</a>
                                <a className="dropdown-item" href="#">Friend</a>
                                <a className="dropdown-item" href="#">Report</a>
                            </div>
                        </div>
                        <label className="inline">
                            <span className="muted">&nbsp;&nbsp;to</span>
                            <span className=" small-text">johnsmith@skyace.com</span>
                        </label>
                    </div>
                </div>
            </div>
            <div className="clearfix" />
            <div className="email-content-body m-t-20">
            </div>
            <div className="wysiwyg5-wrapper b-a b-grey m-t-30">
                <textarea className="email-reply" placeholder="Reply" defaultValue={ ""} />
            </div>
        </div>
    </div>
</div>
    )
}

export default Opened
