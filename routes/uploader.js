var express = require("express");
var router = express.Router();

var multipart = require("connect-multiparty");
const path = require("path");
var multipartMiddleware = multipart();
//에디터 파일첨부
router.post("/editor", multipartMiddleware, function (req, res) {
  var fs = require("fs");
  var orifilepath = req.files.upload.path;
  var orifilename = req.files.upload.name;
  var srvfilename = Date.now() + path.extname(orifilename);
  fs.readFile(req.files.upload.path, function (err, data) {
    var newPath = __dirname + "/../uploads/editor/" + srvfilename;
    fs.writeFile(newPath, data, function (err) {
      if (err) console.log({ err: err });
      else {
        html =
          '{"filename" : "' +
          orifilename +
          '", "uploaded" : 1, "url": "/uploads/editor/' +
          srvfilename +
          '"}';

        res.send(html);
      }
    });
  });
});

module.exports = router;
