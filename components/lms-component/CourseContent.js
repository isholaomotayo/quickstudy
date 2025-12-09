import React from 'react'


// Fetch this using CourseModule_id
const CourseModuleData = {
    id: 3,
    name: 'Fundamental Concepts in Computer Engineering',
    description: 'This Module covers the core concepts for starting out as a Computer Engineer'
}
const mockCourseLessons = [
    {id: 1, course_module_id: 1, name: 'Why Computer Engineering?', order: 1, duration: '4 min', completed:'fa-check-circle'},
    {id: 2, course_module_id: 1, name: 'Common industry terminologies', order: 2, duration: '8 min',
        description: "Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.Understand the key jargons that trip up newbies in the technology industry.",
        completed:'fa-check-circle'
    },
    {id: 3, course_module_id: 1, name: 'Modern languages and frameworks', order: 3, duration: '12 min'},
    {id: 4, course_module_id: 1, name: 'The software development lifecycle', order: 4, duration: '5 min'},
    {id: 5, course_module_id: 1, name: 'Common industry misconceptions', order: 1, duration: '3 min'}
]
const CourseContent = () => {
    return (
        <>
            <div className="col-xs-7 col-md-9 order-md-2 mle">
                        <div className="lesson-content-wrapper bg-dark-purple align-middle text-center">
                            <div>
                                <img src="/assets/img/lms/courseVideo.jpg" alt="" 
                                data-src="/assets/img/lms/courseVideo.jpg" 
                                data-src-retina="/assets/img/lms/courseVideo.jpg" 
                                width="80%" className="video-image m-3" />
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-body pt-1">
                                <h6 className="card-title mt-0">{ mockCourseLessons[1].name }</h6>
                                <p className="card-text">
                                    { mockCourseLessons[1].description }
                                </p>
                            </div>
                        </div>
                    </div>
        </>
    )
}

export default CourseContent
