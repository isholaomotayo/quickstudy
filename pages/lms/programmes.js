import Layout from '../../components/Layout'
import Table from '../../components/Table'
import { protectPage, getTableData } from '../../helpers/utils'

const tableCols = ['name', 'years']
const formFields = []

const Programmes = props => (
    <Layout pageTitle="Programmes" userData={props.userData}>
        <Table 
            rows={props.programmes} 
            tableName="programme" 
            tableCols={tableCols}
            formFields={formFields}
            itemName="Program"
            subPage="lms/courses" 
            subIsList={true}
            subLinkTitle="Courses" 
            passToSubPage={["department_id"]}
            passToForm={["department_id"]}
            deleteAccess={["SUPERADMIN", "ADMIN"]}
            userData={props.userData}
            />
    </Layout>
)

Programmes.getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ['SUPERADMIN', 'ADMIN', 'HOD']
    const {token, role, userId, userData} = protectPage(req, res, allowedRoles)
    
    const [programmes, parent] = await getTableData('programme', 'department_id', query, [], true, req)
    return { programmes, parent, userData }
}

export default Programmes