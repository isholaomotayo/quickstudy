import Layout from '../../components/Layout'
import Table from '../../components/Table'
import { protectPage, getTableData } from '../../helpers/utils'

const tableCols = ['id', 'code', 'name', 'email', 'paywall_on'] // Use to restrict table to some specific fields
const formFields = []   // Use to restrict form to some specific fields

const Institutions = props => (
    <Layout pageTitle="Institutions" userData={props.userData}>
        <Table 
            rows={props.institutions} 
            tableName="institution" 
            tableCols={tableCols}
            formFields={formFields}
            itemName="Institution"
            subPage="lms/faculties" 
            subIsList={true}
            subLinkTitle="Faculties" 
            deleteAccess={["SUPERADMIN"]}
            />
    </Layout>
)

Institutions.getInitialProps = async ({ req, res, err }) => {
    const allowedRoles = ['SUPERADMIN']
    const {token, role, userId, userData} = protectPage(req, res, allowedRoles)
    
    const [institutions] = await getTableData('institution', '', {}, [], false, req)

    return { institutions, userData }
};

export default Institutions
