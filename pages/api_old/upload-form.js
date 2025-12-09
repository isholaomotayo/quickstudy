// const request = require("request");
// const API_URL = process.env.API_URL;
// let multiparty = require('multiparty')
// let http = require('http')
// let util = require('util')

// export default (req, res) => {
//     if (req.method === "POST") {
//         let form = new multiparty.Form();
//         form.parse(req, (err, fields, files) => {
//             res.writeHead(200, { 'content-type': 'text/plain' });
//             res.write('ok');
//             res.end(util.inspect({ fields: fields, files: files }));
//         });
//         console.log(req.fields, req.files, res.fields, res.files, form)
//         return;
//     } else {
//         res.writeHead(405, { 'content-type': 'text/plain' });
//         res.end("Method not allowed. Send a POST request.");
//         return;
//     }
// }
