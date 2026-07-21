import crypto from "crypto";

const requestIdMiddleware = (req, res, next) => {
    // Generate UUID or use the incoming Request ID header (e.g. from cloud load balancer)
    const requestId = req.headers["x-request-id"] || crypto.randomUUID();
    req.id = requestId;
    res.setHeader("X-Request-Id", requestId);
    next();
};

export default requestIdMiddleware;
