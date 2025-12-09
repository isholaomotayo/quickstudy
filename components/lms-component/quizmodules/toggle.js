import React from 'react'

const Toggle = (props) => {
    return (
        <div className='toggler'>
             <i className="fa fa-bars text-dark" onClick={props.click}></i>

             <style jsx>
                 {`
                    .toggler{
                        position: fixed;
                        top:40px;
                        right: ${props.open? '350px' : '40px'};
                    }
                 `}
             </style>
        </div>
    )
}

export default Toggle
