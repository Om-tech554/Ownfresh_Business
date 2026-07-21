import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        eventType: {
            type: String,
            enum: [
                "REFERRAL_CREATED",
                "REFERRAL_USED",
                "REFERRAL_APPROVED",
                "REFERRAL_REJECTED",
                "WALLET_UPDATED",
                "ADMIN_ACTION",
                "LOGIN",
                "FAILED_VALIDATION",
                "API_ERROR",
                "RECEIPT_UPLOAD",
                "OCR_PROCESSING",
                "OCR_FAILURE",
                "TRACKING_GENERATION",
                "EMAIL_PREVIEW",
                "TEST_EMAIL_SENT",
                "SHIPMENT_EMAIL_SENT"
            ],
            required: true,
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true
        },
        ipAddress: {
            type: String
        },
        requestId: {
            type: String,
            required: true,
            index: true
        },
        device: {
            type: String
        },
        browser: {
            type: String
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true
        },
        details: {
            type: mongoose.Schema.Types.Mixed
        }
    },
    { timestamps: true }
);

export default mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
