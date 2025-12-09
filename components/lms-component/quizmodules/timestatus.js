import React from 'react'

const Timestatus = () => {
    return (
        <div className='col-lg'>

       <h5>Time Status</h5>

        <div className='count mt-5 text-center'>00: 30: 00</div>
        <div className='total mb-5'>Total time <span className='secs'>00:30:00</span></div>
       <style jsx>
           {`
           
            .total{
                font-size: 16px;
                // background-color: #fff;
                width: 100%;
                display: inline;
                position: relative;
                top: 30px;
            }
            .count{
                color: green;
                font-size:35px;
            }
            .secs{
                margin-left: 120px;
            }
      
           `}
       </style>
     </div>
    )
}

export default Timestatus
