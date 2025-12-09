import React from 'react'

const Toolbar = (props) => {
    return (
        <div className='toggler'>
             <i className="fa fa-bars text-dark" onClick={props.click}></i>

             <style jsx>
                 {`
                    .toggler{
                        
                        top:40px;
                        left: ${props.open? '0px' : '40px'};
                    }
                 `}
             </style>
        </div>
    )
}

export default Toolbar
