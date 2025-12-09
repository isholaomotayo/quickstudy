import React from 'react'

const questions = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20, 21]
 
 const Category = (props) => {
    return (
        <div className='col-lg mt-5 px-3'>
           <div className='cat-contain'>
            <h5 className='text-dark '>Thermodynamics</h5>
            <span className='cat-contain-title'>Computer science questions</span>   
           </div>
            <div className='quest-contain mt-3'>
                {questions.map((x, i) => (<button className='btn btn-primary' key={i}>{i + 1}</button>))}
            </div>

            <style jsx>
                {`
                .cat-contain-title{
                    font-size: 20px;
                }
                 .quest-contain{
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    grid-gap: .2rem;
                    padding: 0 1rem .5rem 1rem;
                }
                `}
            </style>
        </div>
    )
}

export default Category
