import Link from 'next/link'

const VideoCarde = () => {
    return (
      <div className="card mb-3" style={{maxWidth: 540}}>
      <div className="row no-gutters">
        <div className="col-md-4">
        <div className="card-media">
            <div className="embed-responsive embed-responsive-16by9">
              <iframe width={1280} height={720} src="https://www.youtube.com/embed/bTqVqk7FSmY?autoplay=0&share=0" allow="autoplay; encrypted-media" />
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card-body">
            <h5 className="card-title">The empiricism in complexities</h5>
            <p className="card-text">What is dynamics physiology?</p>
            <Link href='/view-course' className='text-primary'>Continue</Link>
          </div>
        </div>
      </div>
    </div>
    );
}

export default VideoCarde;