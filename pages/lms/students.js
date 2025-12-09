import Layout from "../../components/Layout"
import Table from "../../components/Table"
import { protectPage, getTableData } from "../../helpers/utils"

const tableCols = ["username", "first_name", "last_name", "gender", "email"]
const formFields = [
    "username", "first_name", "last_name", "other_name", "gender", "email", 
    "phone", "personal_info", "enable_contact_me", "institution_id", 
    "registration_source", "referral_code", "created_at", "updated_at", "active",
]
const disabledFields = ["username", "password", "registration_source", "code", "reset_code"]
// const selectFields = {
//     role: ["STUDENT", "STAFF", "ADMIN"]
// }

const Students = props => (
    <Layout pageTitle="Students" userData={props.userData}>
        <Table 
            rows={props.students} 
            tableName="user" 
            tableCols={tableCols}
            formFields={formFields}
            itemName="Student"
            disabledFields={disabledFields}
            hideAdd={true}
            writeAccess={['SUPERADMIN', 'ADMIN', 'HOD']}
            userData={props.userData}
            //selectFields={selectFields}
        />
    </Layout>
)

Students.getInitialProps = async ({req, res}) => {
    const allowedRoles = ['SUPERADMIN', 'ADMIN', 'HOD', 'STAFF']
    const {token, role, userId, userData} = protectPage(req, res, allowedRoles)
    
    const [students] = await getTableData('user', 'role', {'role': 'STUDENT'}, [], false, req)
    return { students, userData }
};

export default Students