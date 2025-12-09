const GridLayout = (props) => {
    return(
        
<div className="container  pull-up">
    <div className="row">
        <div className="col-lg-4 m-b-30">
            <div className="card m-b-30">
            {props.children}
            </div>
        </div>

      </div>
</div>

    )
}

export default GridLayout;