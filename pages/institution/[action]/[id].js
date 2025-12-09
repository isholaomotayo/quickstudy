import fetch from 'isomorphic-unfetch';

const Post = props => (
  <div>
    <h1>{props.institution.name}</h1>
    <p>{props.institution.email}</p>
    <p>{props.institution.address}</p>
    <p>{props.institution.phone}</p>
    <img src={props.institution.logo} />
  </div>
);

Post.getInitialProps = async function(context) {
  const { id } = context.query;

  var institution_id = id;
  console.log(id);
  const res = await fetch(
    `${process.env.API_URL}/api/institution/${institution_id}`,
    {
      //mode: "no-cors",
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
  const institution = await res.json();

  console.log(`Fetched institution: ${institution.name}`);

  return { institution };
};

export default Post;
