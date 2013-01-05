
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.send({
    _links: {
      self: {href: req.fqdn+"/"}
    },
    _templates: {
      create: {target: req.fqdn+"/carts", method: "post", form: {
        user: {prompt: "User", value: ""}
      }}
    }
  });
};

