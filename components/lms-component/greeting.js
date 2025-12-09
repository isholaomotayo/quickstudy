const Greeting = (props) => {
 return (
    <section className='container mb-3'>
    <h2 className='h2s'>Welcome back {props.name}</h2>
    <span className='spans'>Continue from where you stopped</span>

<style jsx>{`
    .h3s{
        font-size: 20px;
        font-weight: bold;
    }

    .spans{
        font-size: 18px;
        font-weight: 400;
    }

    
`}</style>
</section>
 )
}

export default Greeting;