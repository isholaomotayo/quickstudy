import React from 'react'
import Link from 'next/link'

const Courseinstruction = () => {
    return (
        <section className='section container'>
           <section className='inner-section '>
            <section className=' row pt-4 section-header it' >
            <p className='lead col-sm-12 col-lg-6 '>Instructions: </p>
            <p className='lead col-sm-12 col-lg-6 float-right'> 
            Please Read The Instructions Carefully
            </p>
            </section>
            <section className='row px-3 py-2 bg-fff bt-2'>
                <h3 className='col-lg-12'>Exam Name: Thermodynamics</h3>
                <p className='col-lg-12 p'><span className='pb-3'>General Instructions :</span>please read all instructions properly before proceeding to the next page.</p>
                <div className='col-lg-12'>
                <h5 className=' bold'>Timing</h5>
                <div className='borderless'>
                <li className="list-group-item ">Cras justo odio</li>
                <li className="list-group-item">Dapibus ac facilisis in</li>
                </div>
                </div>
                <div className='col-lg-12'>
                <h5 className=' bold'>Personal Belongings</h5>
                <div className='borderless list-unstyled'>
                <li className="list-group-item">Cras justo odio</li>
                <li className="list-group-item">Dapibus ac facilisis in</li>
                </div>
                </div>
                <div className='col-lg-12 bt-2 mt-4 pt-2'>
               
                <div className='spans'>
                    <div className='icons bg-success'><i className='fa fa-check text-center'></i></div>
                    You have answered this questions
                </div>
                <div className='spans'>
                    <div className='icons bg-danger'><i className='fa fa-close text-center'></i></div>
                    You have not answered this questions
                </div>
                {/* <div className='spans'>
                    <div className='icons bg-success'><i className='fa fa-check text-center'></i></div>
                    You have answered this questions
                </div> */}
                {/* <div className='spans'>
                    <div className='icons bg-success'><i className='fa fa-check text-center'></i></div>
                    You have answered this questions
                </div> */}
                </div>
                <div className='col-lg-12'>
                <Link href='/lms/module-test' legacyBehavior><a className='btn btn-complete text-white float-right my-2'>Proceed</a></Link>
                </div>
            </section>
           </section>
           <style jsx>
            {`
            .section{
                background-color: #eee;
                height: 75vh;
                box-shadow: 0 4px 6px 0 hsla(0, 0%, 0%, 0.2);
            }

            // .inner-section{
            //     height: 80%;
            // }

            .section-header{
                background-color: #fff;
            }
            .it{
                font-weight: 400;
                color: #3C92CE;
                
            }
            .bt-2{
                border-top: 1px solid #eee;
            }
            .bg-fff{
                background-color: #fff;
            }
            .p{
                font-size: 14px;
            }
            .p>span{
                display: block;
                font-size: 18px;
                font-weight: bold;
            }

            .icons{
                display: inline-block;
                margin: 0 auto;
                padding: 5px 10px;
                margin-right: 10px;
                border-radius: 5px;
                color: #fff;
                margin-bottom: 8px;
            }
            `}
           </style>
        </section>
    );
}

export default Courseinstruction
