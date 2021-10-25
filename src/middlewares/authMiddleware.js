exports.authMiddleware = (request, response, next) => {
  const { username } = request.session;

  if (!username) {
    response.redirect("/");
    return;
  }

  return next();
};

exports.isAuthenticate = (request, response, next) => {
  const { username } = request.session;

  if (username) {
    response.redirect("/dashboard");
    return;
  }

  return next();
};
