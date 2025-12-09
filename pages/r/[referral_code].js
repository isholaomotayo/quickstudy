import { bounceToPage, setAffiliateCookies, checkDataRowExists } from '../../helpers/utils'

const R = props => {
    // In case this page doesn't forward to home
    return (
        <a 
            href="/"
            style={{display: "inline-block", margin: "100px 45%"}}
        >
            Click Here
        </a>
    )
}

R.getInitialProps = async ({ req, res, query }) => {
    const referral_code = query.referral_code

    if (referral_code) {
        const affCheckQuery = {username: referral_code, checkRelated: "affiliate"}
        const [referrerExists, error] = await checkDataRowExists('user', 'username', affCheckQuery)
        
        if (+referrerExists) await setAffiliateCookies(referral_code, res)
    }

    bounceToPage("/", res)

    return { nothing: 1 }
};

export default R
