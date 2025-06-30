function attachUserId(req, res, next) {
  const userId = req?.payload?.userId;
  if (userId) {
    // Attach the user ID to the request object
    req.userId = userId;
    next();
  } else {
    // If not authenticated, return 401 Unauthorized
    res.sendStatus(401);
  }
}

export default attachUserId;
