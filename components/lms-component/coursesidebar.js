import React from 'react'
import Link from 'next/link'
const Coursesidebar = () => {
    return (
        <div className='contain'>
            <div className='pl-3'>
            <Link href='#' legacyBehavior><a className='btn mt-3  float-md-right btn-lg fs-16' style={{backgroundColor:'#375BCE', color:'#fff'}}>Forum</a></Link>
            </div>
            <br />
            <div className='row mt-4 ml-2 ts pb-5'>
            <div className='col-sm-12 col-md-12 mb-2 bod pb-3'>
          <span className='ml-2'>Duration: <span className='bld'>6 hours</span></span>
          <i className='fa fa-clock-o bluee fse float-right' style={{color:'#375BCE', fontSize:'30px'}}></i>
            </div>
            <div className='col-sm-12 col-md-12 mb-2 bod pb-3'>
          <span className='ml-2'>Omotayo Isola</span>
          <i className='fa fa-graduation-cap bluee float-right' style={{color:'#375BCE', fontSize:'29px'}}></i>
            </div>
            <div className='col-sm-12 col-md-12 mb-2 bod pb-3'>
          <span className='ml-2'>Omotayo Isola</span>
          <i className='fa fa-soundcloud bluee float-right' style={{color:'#375BCE', fontSize:'29px'}}></i>
            </div>
            </div>
            <style jsx>
                {`
                .ts{
                    font-size: .9rem;
                    font-weight: lighter !important;
                }
                .bld{
                    font-weight: 600;
                }
                .fse{
                    font-size: 1.5rem;
                }
                .bod{
                    border-bottom: 1px solid #eee;
                }
                .bluee{
                    color: ##375BCE !important;
                }
                `}
            </style>
        </div>
    );
}

export default Coursesidebar
