import { useState } from 'react'
import Link from 'next/link'
import Card from 'react-bootstrap/Card'
import Modal from './Modal'
import DBForm from '../helpers/DBForm'
import { setTableRow } from '../helpers/utils'

const ModuleTestLink = props => (
    '' 
    &&
    <Card>
        <Card.Header>
            <b>Module Tests</b>
        </Card.Header>
        <Card.Body>
        {
            <div className="row item">
                xxx
            </div>
        }
        </Card.Body>
    </Card>
);

export default ModuleTestLink
