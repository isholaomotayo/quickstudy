import React from 'react'

const questions = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20, 21]
 
const Summary = () => {
    return (
        <div className=''>
            <span className='summary'>Summary</span>

<div className='sum-contain'>
    <div>
        <button className='btn btn-default bt'>0</button>
        <p className='p'>Answered</p>
    </div>
    <div>
        <button className='btn btn-default bt'>0</button>
        <p className='p'>Marked</p>
    </div>
    <div>
        <button className='btn btn-default bt'>0</button>
        <p className='p'>Not Answered</p>
    </div>
    <div>
        <button className='btn btn-default bt'>{questions.length}</button>
        <p className='p'>Not Visited</p>
    </div>
</div>
<style jsx>
    {`
    .sume{
        border-top: .001rem solid #c9ccd3;
    }
    .summary{
        color:#000;
        font-size:1.5rem;
        padding: 2rem !important;
        
    }
    .sum-contain{
        display: grid;
        grid-template-columns: repeat(2,1fr);
        grid-gap: 1rem;
        margin: 3rem auto;
        padding: 0 2rem .5rem 1rem;
        
    }

    .sum-contain > div{
        width: 10rem;
    }
    .p{
        display: inline;
        font-size: .9rem;
        // padding-left: 1rem;
        color: #000;
    }
    .bt{
        margin-right: .5rem;
    }
    `}
</style>
        </div>
    )
}

export default Summary
