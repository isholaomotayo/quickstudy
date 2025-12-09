import Breadcrumb from "react-bootstrap/Breadcrumb";

const Breadcrumbs = props => {
  let thisRoute = "/",
    thisRouteName = "Home",
    thisRouteActive = false

  const routeParts = props.pagePath.split("/");
  let crumbParts = [];

  for (const [i, routePart] of routeParts.entries()) {
    thisRoute += `${i > 1 ? "/" : ""}${routePart}`;
    thisRouteActive = props.pagePath == thisRoute;

    if (i > 0) {
      if (!routePart) continue

      if (thisRouteActive && props.pageTitle) {
        thisRouteName = props.pageTitle;
      } else {
        thisRouteName = routePart.replace("-", " ")
        thisRouteName = thisRouteName[0].toUpperCase() + thisRouteName.slice(1)
      }
    }

    crumbParts.push(makeCrumb(`bcrumb${i}`, thisRoute, thisRouteName, thisRouteActive))
  }

  if (props.parentNavs) {
    const [first, last] = [crumbParts[0], crumbParts[crumbParts.length - 1]]
    crumbParts = [first]
    props.parentNavs.forEach((parentNav, j) => {
      crumbParts.push(makeCrumb(`bcrumb-x${j}`, parentNav.route, parentNav.title, false))
    })
    crumbParts.push(last)
  }

  return <Breadcrumb>{crumbParts}</Breadcrumb>
};

function makeCrumb(key, href, title, isActive) {
  return(
    <Breadcrumb.Item
      key={key}
      href={href}
      active={isActive}
    >
      {title}
    </Breadcrumb.Item>
  )
}

export default Breadcrumbs
