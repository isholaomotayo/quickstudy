const PlainCard = ({cardTitle,cardClass, titleIconClass, header,subheader, actionUrl,actionText}) => (
    <div className="col-lg-3 col-sm-6 m-b-10 d-inline-block">
                <div className="ar-2-1">
                {/* START WIDGET widget_statTile*/}
                <div className={`${cardClass}`}>
                    <div className="card-header  top-left top-right ">
                    <div className="card-title hint-text">
                        <span className="font-montserrat fs-11 all-caps">
                         {cardTitle}
                        <i className={`${titleIconClass}`} />
                        </span>
                    </div>
                    <div className="card-controls">
                        <ul>
                        <li>
                            <a
                            data-toggle="refresh"
                            className="card-refresh"
                            href="#"
                            >
                            <i className="card-icon card-icon-refresh" />
                            </a>
                        </li>
                        </ul>
                    </div>
                    </div>
                    <div className="card-body p-t-40">
                    <div className="row">
                        <div className="col-sm-12">
                        <h4 className="no-margin p-b-5">
                            {header}
                        </h4>
                        <div className="pull-left small">
                            <span>{subheader}</span>
                            
                        </div>
                        <div className="clearfix" />
                        </div>
                    </div>
                    <div className="p-t-10 full-width">
                        <a
                        href={`${actionUrl}`}
                        >
                        <i className="fa fa-arrow-circle-o-right" /> </a>
                      <span className="hint-text small">

                      <a
                        href={`${actionUrl}`}
                        > {actionText} </a>
                        </span>
                    </div>
                    </div>
                </div>
                {/* END WIDGET */}
                </div>
                <style jsx>{`
        h1, h2, h3, h4, h5   { color: inherit; }
        a, i {
            color: inherit;
        }
        
    `}</style>
            </div>
);
PlainCard.defaultProps = {
    cardTitle: '',
    cardClass: 'widget-10 card no-border bg-white no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: '',
    subheader: '',
    actionUrl: '#',
    actionIcon: 'fa fa-arrow-right',
    actionIconClass: 'btn-circle-arrow b-grey',
    actionText: 'Show More'
};

export default PlainCard;