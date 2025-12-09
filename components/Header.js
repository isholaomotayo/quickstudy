import Link from 'next/link'

const Header = props => {
  const [navOpen, setNavOpen] = props.navManagers
  const myAvatarSrc = (props.userData && props.userData.avatar) || "/assets/img/profiles/default-user.png"
  
  return (
    <div className="header ">
    {/* START MOBILE SIDEBAR TOGGLE */}
    <a 
      href="#" 
      className="btn-link toggle-sidebar d-lg-none pg pg-menu" 
      data-toggle="sidebar"
      onClick={() => setNavOpen(!navOpen)}
    >
    </a>
    {/* END MOBILE SIDEBAR TOGGLE */}
    <div>
      <div className="brand inline">
        <Link href="/" legacyBehavior>
          <a style={props.logoStyle}>{props.appTitle}</a>
        </Link>
        {/* 
        <img src="/assets/img/logo_2x.png" alt="logo" data-src="/assets/img/logo.png" data-src-retina="/assets/img/logo_2x.png" width={78} height={22} />
        */}
      </div>
      {/* START NOTIFICATION LIST */}
      {/* 
      <ul className="d-lg-inline-block  notification-list no-margin d-lg-inline-block b-grey b-l b-r no-style p-l-30 p-r-20">
        <li className="p-r-10 inline">
          <a href="#" className="header-icon fa fa-bell fa-lg" data-toggle="dropdown">
          <span className="bubble" />
          </a>
        </li>
        <li className="p-r-10 inline">
          <a href="#" className="header-icon fa fa-envelope fa-lg" data-toggle="dropdown">
          </a>
        </li>
        <li className="p-r-10 inline">
          <a href="#" className="header-icon pg pg-thumbs">
          </a>
        </li>
      </ul> 
      */}
      {/* END NOTIFICATIONS LIST */}
      <a href="#" className="search-link d-lg-inline-block " data-toggle="search" id='search'>
        <i className="pg-search" />Type anywhere to <span className="bold">search</span>
      </a>
    </div>
    <div className="d-flex align-items-center">
      {
        props.userData
        ?
        <>
        {/* START User Info*/}
          <div className="pull-left p-r-10 fs-14 font-heading d-lg-block ">
            <span className="semi-bold">
              {(props.userData.first_name) || 'My'}{' '}
              {(props.userData.last_name) || 'Name'}
            </span> 
          </div>
          <div className="dropdown pull-right d-lg-block  mr-3">
            <button className="profile-dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <span className="thumbnail-wrapper d32 circular inline">
                <img 
                  src={myAvatarSrc}
                  alt="" id='userAvatar'
                  data-src={myAvatarSrc} 
                  data-src-retina={myAvatarSrc} 
                  width={32} height={32}  
                />
              </span>
            </button>
            <div className="dropdown-menu dropdown-menu-right profile-dropdown" role="menu" x-placement="bottom-end" style={{position: 'absolute', transform: 'translate3d(0px, 5px, 0px)', top: 0, left: 0, willChange: 'transform'}}>
              <a href="#" className="dropdown-item"><i className="pg-settings_small" /> Settings</a>
              <a href="#" className="dropdown-item"><i className="pg-outdent" /> Feedback</a>
              <a href="#" className="dropdown-item"><i className="pg-signals" /> Help</a>
              <a href="#" className="clearfix bg-master-lighter dropdown-item">
                <span className="pull-left">Logout</span>
                <span className="pull-right"><i className="pg-power" /></span>
              </a>
            </div>
          </div>
        {/* END User Info*/}
        </>
        :
        ''
      }
      <a href="#" className="header-icon pg pg-alt_menu btn-link  sm-no-margin d-inline-block" data-toggle="quickview" data-toggle-element="#quickview" />
    </div>
    <style jsx>{`
          .header-icon {
            position: relative;
          }
    `}</style>
  </div>
  );};

export default Header;
