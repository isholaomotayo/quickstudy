import { Card, Tabs, Tab } from "react-bootstrap";

const HTabs = ({ tabs = [], defaultPane = "", ...props }) => (
  <Card className="card-borderless">
    <Tabs defaultActiveKey={defaultPane} id="htabs">
      {tabs.map(
        ({ tabId, tabTitle, paneTitle, paneSubTitle, paneContent }, i) => (
          <Tab eventKey={tabId} title={tabTitle} key={`tab-${i}`}>
            <div>
              <h4>{paneTitle}</h4>
              {paneSubTitle ? (
                <div className="mb-2 mt-0">{paneSubTitle}</div>
              ) : (
                ""
              )}
              <div>{paneContent}</div>
            </div>
          </Tab>
        )
      )}
    </Tabs>
    <style jsx global>{`
      .card-header-pills,
      .card-header-tabs {
        margin-left: 0;
      }
      .nav-tabs a.nav-item.nav-link {
        display: block;
        border-radius: 0;
        padding: 13px 20px;
        margin-right: 0;
        font-family: montserrat;
        font-weight: 500;
        letter-spacing: 0.06em;
        color: rgba(98, 98, 98, 0.7);
        font-size: 10.5px;
        min-width: 70px;
        text-transform: uppercase;
        border-color: transparent;
        position: relative;
        line-height: 1.7em;
      }
      .nav-tabs a.nav-item.nav-link:hover,
      .nav-tabs a.nav-item.nav-link.active {
        border-bottom: 2px solid red;
      }
    `}</style>
  </Card>
);

export default HTabs;
