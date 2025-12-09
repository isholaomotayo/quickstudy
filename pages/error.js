import Layout from '../components/Layout'
import { translateCode } from '../helpers/language/translate'

const ErrorPage = props => {

    return (
    <Layout 
        pageTitle={props.heading} 
        className="error-page"
        showBreadcrumb={false}
    >
        <div className="d-flex justify-content-center">
        <div className="text-center my-auto">
            <h1 className="error-number">{props.heading}</h1>
            <h2 className="semi-bold">{props.details}</h2>
        </div>
        </div>
    </Layout>
    )
}

ErrorPage.getInitialProps = async ({ query }) => {
    let [heading, details] = ["Error!", "There's a problem accessing the page."]
    if (query.code) [heading, details] = translateCode(query.code)
    
    //console.log(query.code, heading, details)
    return { heading, details }
}

export default ErrorPage
