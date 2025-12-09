
import Link from 'next/link';

const Breadcrumbs = props => {
    let thisRoute = '/',
        thisRouteName = 'Home',
        thisRouteLink = '',
        thisRouteActive = false

    const routeParts = props.pagePath.split('/')
    const crumbParts = []

    for (const [i, routePart] of routeParts.entries()) {
        thisRoute += `${i > 1 ? '/' : ''}${routePart}` 
        if (i > 0) {
            if (!routePart) continue;
            
            thisRouteName = routePart.replace('-', ' ')
            thisRouteName = thisRouteName[0].toUpperCase() + thisRouteName.slice(1)    
        }
        thisRouteLink = <Link href={thisRoute}>{thisRouteName}</Link>
        thisRouteActive = false

        if (props.pagePath == thisRoute) {
            thisRouteLink = thisRouteName
            thisRouteActive = true
        }

        crumbParts.push(
            <li key={`bcrumb${i}`} className={`breadcrumb-item${thisRouteActive ? ' active' : ''}`}>
                {thisRouteLink}
            </li>
        )
    }

    return (
        <ol className="breadcrumb">
            {crumbParts}
        </ol>
    )
    
}
    

export default Breadcrumbs
