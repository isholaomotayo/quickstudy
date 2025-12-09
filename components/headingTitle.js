const HeadingTitle = (props) => {
    return (
        <div className="text-center">
        <div className="inline-block">
            {props.children}
        </div>
    </div>
    )
}
const PageTitle = (props) => {
    return (
        <div className="text-left">
        <div className="inline-block">
            {props.children}
        </div>
    </div>
    )
}
export {
    HeadingTitle,
    PageTitle
}