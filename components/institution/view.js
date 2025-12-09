import React from "react";

const InstitutionView = (props) => (
  <div>
    <h1>{props.institution.name}</h1>
    <p>{props.institution.email}</p>
    <p>{props.institution.address}</p>
    <p>{props.institution.phone}</p>
    <img src={props.institution.logo} />
  </div>
);
InstitutionView.getInitialProps = async function (context) {
  const { id } = context.query;

  var institution_id = 1;
  console.log(id);
  const res = await fetch(`${process.env.API_URL}/api/institution/1`, {
    //mode: "no-cors",
    method: "get",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
  const institution = (await res.json()) ? res.json() : [];

  // console.log(`Fetched institution: ${institution.name}`);

  return { institution };
};

export default InstitutionView;
