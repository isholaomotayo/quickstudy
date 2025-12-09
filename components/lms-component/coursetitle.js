import React from 'react'

const Coursetitle = () => {
    return (
       <section className=''>
           <div className="card card-default  text-white contain">
  <div className="card-header">
    <div className="card-title leads fse pb-3">Introduction to computer science
    </div>
  </div>
  <div className="text-dark card-block pl-4 fs-16">
      <div className='row'>
      <div className='mb-3 col-sm-12 col-md-6'>
          <i className='fa fa-graduation-cap ' style={{color:'#375BCE'}}></i><span className='ml-2'>Omotayo Isola</span>
      </div>
      <div className='mb-3 col-sm-12 col-md-6'>
          <i className='fa fa-book ' style={{color:'#375BCE'}}></i><span className='ml-2'>Computer science </span>
      </div>
      </div>
  </div>
  </div> 





            <style jsx>
            {`
                .fse{
                    font-size: 2rem !important;
                    font-weight: normal !important;
                    border-bottom: 1px solid #eee;
                    width: 100%;
                }
                .dis{
                    display: inline-block !important;
                }
                .contain{
                    width: 100%;
                }
                .leads{
                    text-transform: capitalize !important;
                    font-weight: lighter;
                }
                @media (max-width: 768px){
                    .fse{
                        font-size: 1rem !important; 
                    }
                    .contain{
                        width: 100%;
                    }
                }
            `}    
            </style>   
        
        </section>
    )
}

export default Coursetitle
        