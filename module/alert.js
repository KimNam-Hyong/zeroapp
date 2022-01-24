let alert = (str, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.write("<script>");
  res.write(`alert('${str}');`);
  res.write("history.back();");
  res.write("</script>");
  res.end();
};

module.exports = alert;
