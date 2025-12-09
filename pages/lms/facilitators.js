import Layout from '../../components/Layout'
import Table from '../../components/Table'
import { protectPage, getTableData } from '../../helpers/utils'


const tableCols = ['username', 'first_name', 'last_name', 'gender', 'email']
const formFields = []
const disabledFields = ['username', 'password', 'registration_source', 'code', 'reset_code']

const Facilitators = props => (
    <Layout pageTitle="Facilitators" userData={props.userData}>
        <Table 
            rows={props.facilitators} 
            tableName="user" 
            tableCols={tableCols}
            formFields={formFields}
            itemName="Facilitator"
            disabledFields={disabledFields}
            hideAdd={true}
            writeAccess={['SUPERADMIN', 'ADMIN', 'HOD']}
            userData={props.userData}
        />
    </Layout>
)


Facilitators.getInitialProps = async ({req, res}) => {
    const allowedRoles = ['SUPERADMIN', 'ADMIN', 'HOD', 'STAFF']
    const {token, role, userId, userData} = protectPage(req, res, allowedRoles)
    
    const [facilitators] = await getTableData('user', 'role', {'role': 'STAFF'}, [], false, req)
    return { facilitators, userData }
};

export default Facilitators