import React from 'react'

const Sidebar = (props) => {
    return (
        <div className='row elements'>
           {props.children}
            <style jsx>
            {
                `
                .elements{
                    padding: 8px 8px 8px 32px;
                    font-size: 25px;
                    display: block;
                    transition: 0.3s;
                }
                `
            }
        </style>  
        </div>
    )
}

export default Sidebar
