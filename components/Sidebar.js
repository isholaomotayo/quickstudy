import NavSet from "./NavSet";

const Sidebar = ({ links, pagePath, appTitle, logoStyle, ...props }) => {
  const sidebarLogoStyle = { ...logoStyle, color: "#fff" };

  return (
    <nav className={`page-sidebar ${props.navOpen ? 'visible' : ''}`} data-pages="sidebar" style={{width: '280px'}}>
      {/* BEGIN SIDEBAR MENU TOP TRAY CONTENT*/}

      {/* END SIDEBAR MENU TOP TRAY CONTENT*/}
      {/* BEGIN SIDEBAR MENU HEADER*/}
      <div className="sidebar-header">
        <span style={sidebarLogoStyle}>{appTitle}</span>
        <div className="sidebar-header-controls">
          <button
            type="button"
            className="btn btn-xs sidebar-slide-toggle btn-link m-l-20"
            data-pages-toggle="#appMenu"
          >
            <i className="fa fa-angle-down fs-16" />
          </button>
          <button
            type="button"
            className="btn btn-link d-lg-inline-block d-xlg-inline-block d-md-inline-block d-sm-none "
            data-toggle-pin="sidebar"
          >
            <i className="fa fs-12" />
          </button>
        </div>
      </div>
      {/* END SIDEBAR MENU HEADER*/}
      {/* START SIDEBAR MENU */}
      <div className="sidebar-menu">
        {/* BEGIN SIDEBAR MENU ITEMS*/}
        <div
          className="scroll-wrapper menu-items"
          style={{ position: "relative" }}
        >
          <NavSet links={links} pagePath={pagePath} />
        </div>
      </div>
      {/* END SIDEBAR MENU */}
      <style jsx>{`
        nav.page-sidebar {
          transition: all 0.3s ease-out;
        }
        nav.page-sidebar:hover {
          transform: translate(200px);
        }
    `}</style>
    </nav>
  );
};

export default Sidebar;
