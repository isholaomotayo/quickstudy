import React from 'react'

const Questions = () => {
    return (
        <div>
            <>
              <div className='main'>
                  <div className='question-info'>
                  <p className='question-num'>1 of 21</p>
                      <p className='question-time mr-5 '><i className='fa fa-clock-o'></i> 00:30:00</p>
                  </div>
                  <h5 className='h5e'>Define Thermodynamics</h5>
                  <div className='options-container row'>
                        <div className='optionss col-sm text-left'>
                        <input type='checkbox' className='mr-3' />
                        <span>One two three</span>
                        </div>
                        <div className='optionss col-sm text-left'>
                        <input type='checkbox' className='mr-3'/>
                        <span>One two three</span>
                        </div>
                  </div>
                  <div className='options-container row'>
                        <div className='optionss col-sm text-left '>
                        <input type='checkbox' className='mr-3'/>
                        <span>One two three</span>
                        </div>
                        <div className='optionss pb-3 col-sm text-left'>
                        <input type='checkbox' className='mr-3'/>
                        <span>One two three</span>
                        </div>
                  </div>
                  <div className='btn-container row px-2 mt-5'>
                    <button className='btn btn-info mr-3 mt-2 '>Previous</button>
                    <button className='btn btn-complete mr-3 mt-2'>Next</button>
                    <button className='btn btn-danger  mr-3 mt-2'>Quit</button>
                    <button className='btn btn-success  mr-3 mt-2'>Submit</button>
                  </div>
              </div> 
              <style jsx>
                  {
                      `
                      .questions{
                          margin-right: 200px;
                      }

                      .question-info{
                          display: flex;
                          justify-content: space-between;
                      }
                      .h5e{
                          font-size: 30px;
                          margin-bottom: 3rem;
                      }
                      .optionss{
                          display: inline-block;
                          margin: 10px 0 0 20px;
                      }

                      .btn-container{
                          display: inline-block;
                      }
                      `
                  }
                  </style> 
            </>
        </div>
    )
}

export default Questions
