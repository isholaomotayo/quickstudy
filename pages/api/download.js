export default (req, res) => {
  // file server
  const REMOTE_URL = "https://res.cloudinary.com/emergingplatforms",
    filePath = req.query.f,
    fileExt = req.query.e,
    friendlyName = req.query.n;

  const fileName =
    friendlyName || filePath.substring(filePath.lastIndexOf("/") + 1);

  // set header
  res.setHeader(
    "content-disposition",
    "attachment; filename=" + `${fileName}.${fileExt}`
  );

  // send request to the original file
  request
    .get(`${REMOTE_URL}${filePath}.${fileExt}`) // download original file
    .on("error", function (err) {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.write("<h1>404 not found</h1>");
      res.end();
      return;
    })
    .pipe(res); // pipe converted file to HTTP response

  //'https://res.cloudinary.com/emergingplatforms/image/upload/v1585995395/ilearn/houmn01vxa2xqif1i8nk.pdf'
};
