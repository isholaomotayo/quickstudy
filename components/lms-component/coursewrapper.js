import React from 'react'

const Coursewrapper = (props) => {
    return (
<div className=" ">
  <div className="content ">
    <div className="social-wrapper">
      <div className="social " data-pages="">
      {props.children}
      </div>
    </div>
  </div>
</div>

    )
}

export default Coursewrapper
