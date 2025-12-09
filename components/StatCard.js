import { Card, Row, Col } from 'react-bootstrap'
import Link from 'next/link'


const StatCard = ({statName, statValue, iconClass, iconColor, statUrl}) => {
    
    return (
        <Card className="mb-4 col-sm-30-rowed d-inline-block stat-card">
            <Card.Body>
                <Row>
                    <Col xs={4} className="icon-wrapper">
                        <i className={`${iconClass} stat-icon`} />
                    </Col>
                    <Col xs={8}>
                        <h3>
                            <span className="semi-bold stat-font">
                                {typeof statValue === 'number' ? statValue.toLocaleString() : statValue}
                            </span>
                        </h3>
                        <p>
                            {
                                statUrl 
                                    ? <Link href={statUrl} legacyBehavior><a className="stat-name">{statName}</a></Link>
                                    : <span className="stat-name">{statName}</span>
                            }
                        </p>
                    </Col>
                </Row>
            </Card.Body>
            <style jsx>{`
                i    { margin: auto; }
                .stat-icon  { margin-top: .1em!important; font-size: 5em; margin-right: 4px; color: ${iconColor} }
                .stat-name  { color: #000; text-decoration: none; }
                .stat-name:hover    { text-decoration: underline; }

                @media screen and (min-width: 576px) and (max-width: 768px) {
                    .stat-icon  { margin-top: .4em!important; font-size: 3.6em; }
                    .stat-font  { font-size: 0.7em; }
                }
            `}</style>
        </Card>
    );
};

export default StatCard;