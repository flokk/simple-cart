
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.send({
    _links: {
      self: {href: req.base+"/"}
    },
    _templates: {
      create: {action: req.base+"/carts", method: "post", form: {
        user: {prompt: "User", value: ""}
      }}
    }
  });
};

