import AuditLog from "../models/auditLogModel.js";

/**
 * Utility to parse User Agent header into basic browser and device descriptors
 */
const parseUserAgent = (userAgent = "") => {
    let device = "Desktop";
    let browser = "Unknown";

    const ua = userAgent.toLowerCase();

    // Device parsing
    if (ua.includes("mobi") || ua.includes("android") || ua.includes("iphone") || ua.includes("ipad")) {
        device = ua.includes("ipad") ? "Tablet" : "Mobile";
    }

    // Browser parsing
    if (ua.includes("chrome") || ua.includes("crios")) {
        browser = "Chrome";
    } else if (ua.includes("firefox") || ua.includes("fxios")) {
        browser = "Firefox";
    } else if (ua.includes("safari") && !ua.includes("chrome")) {
        browser = "Safari";
    } else if (ua.includes("edge") || ua.includes("edg")) {
        browser = "Edge";
    } else if (ua.includes("postman") || ua.includes("runtime")) {
        browser = "Postman API Client";
    }

    return { device, browser };
};

/**
 * Log a system-wide or user-specific event to the audit trail
 * @param {Object} params Logging parameters
 * @param {string} params.eventType Type of event (REFERRAL_CREATED, LOGIN, FAILED_VALIDATION, etc.)
 * @param {Object} params.req Express request object (optional, to capture IP, Request ID, headers)
 * @param {string} params.userId User ID linked to the event (optional)
 * @param {string} params.adminId Admin ID performing the action (optional)
 * @param {any} params.details Event-specific payload/details
 */
export const logEvent = async ({ eventType, req, userId, adminId, details }) => {
    try {
        let ipAddress = "127.0.0.1";
        let requestId = "SYSTEM";
        let device = "Server";
        let browser = "NodeJS";

        if (req) {
            ipAddress = req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress || "127.0.0.1";
            requestId = req.id || "UNKNOWN";
            
            const userAgent = req.headers["user-agent"] || "";
            const parsedUA = parseUserAgent(userAgent);
            device = parsedUA.device;
            browser = parsedUA.browser;

            // Automatically set userId/adminId from request user if not explicitly passed
            if (!userId && req.user) {
                userId = req.user._id;
            }
            if (!adminId && req.user && (req.user.role === "admin" || req.user.role === "blogger")) {
                adminId = req.user._id;
            }
        }

        const logEntry = new AuditLog({
            eventType,
            userId,
            adminId,
            ipAddress,
            requestId,
            device,
            browser,
            details
        });

        await logEntry.save();
        console.log(`[AUDIT LOG] ${eventType} - Request ID: ${requestId}`);
    } catch (err) {
        console.error("❌ Failed to save audit log:", err.message);
    }
};
