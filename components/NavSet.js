import Link from 'next/link';
import ListGroup from 'react-bootstrap/ListGroup';

const NavSet = ({ links, pagePath }) => (
  <ListGroup as="ul" className={`menu-items`}>
    {links.map(({ href, label, iconClass, subMenu }, i) => (
      <ListGroup.Item
        as="li"
        key={`nav-link${i}`}
        className="bg-transparent border-0"
      >
        {href.indexOf('http') === 0
        ?
          <a href={href} 
            className="nav-link-a" 
            target="_blank"
            
            //style={{ width: '80%' }}
          >
            <span className="title">{label}</span>
          </a>
        :
        <Link
          href={href}
          //style={{ width: '80%' }}
          className="nav-link-a">

          <span className="title">{label}</span>

        </Link>
        }
        <span
          className={`icon-thumbnail${pagePath == href ? ' bg-success' : ''}`}
        >
          <i className={iconClass} />
        </span>
        {/* Todo: convert sub menu to use ListGroup
          <ul className="sub-menu" style={{}}>
            {subMenu.map(({ href, label }, i) => (
            <li className="">
              <Link href={href}>
                <a>
                  <span className="title">{label}</span>
                </a>
                <span className="icon-thumbnail">{label[0]}</span>
              </Link>
            </li>
            ))}
          </ul> */}
      </ListGroup.Item>
    ))}
  </ListGroup>
);

export default NavSet;
