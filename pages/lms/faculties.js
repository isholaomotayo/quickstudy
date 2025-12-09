import Layout from '../../components/Layout'
import Table from '../../components/Table'
import { protectPage, getTableData } from '../../helpers/utils'

const tableCols = ['name', 'email']
const formFields = []

const Faculties = props => (
    <Layout pageTitle="Faculties" userData={props.userData}>
        <Table 
            rows={props.faculties} 
            tableName="faculty" 
            tableCols={tableCols}
            formFields={formFields}
            itemName="Faculty"
            subPage="lms/departments"
            subIsList={true}
            subLinkTitle="Departments" 
            passToForm={["institution_id"]}
            userData={props.userData}
            writeAccess={["SUPERADMIN", "ADMIN"]}
            deleteAccess={["SUPERADMIN", "ADMIN"]}
            />
    </Layout>
)

Faculties.getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ['SUPERADMIN', 'ADMIN']
    const {token, role, userId, userData} = protectPage(req, res, allowedRoles)
    
    if (role != 'SUPERADMIN') query.institution_id = userData.institution_id
    const [faculties, institution] = await getTableData('faculty', 'institution_id', query, [], true, req)
    
    return { faculties, institution, userData }
};

export default Faculties