import mongoose from "mongoose";
import crypto from "crypto";

const AttachmentSchema = new mongoose.Schema({
  public_id: String,
  url: String,
  originalName: String,
  fileType: String,
});

const ProofSchema = new mongoose.Schema({
  public_id: String,
  url: String,
  originalName: String,
  description: String,
  submittedAt: { type: Date, default: Date.now },
});

const TimelineSchema = new mongoose.Schema({
  action: String,
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  note: String,
  timestamp: { type: Date, default: Date.now },
});

const ComplaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["pending", "approved", "in_progress", "resolved", "rejected"], default: "pending" },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    attachments: [AttachmentSchema],
    rejectionReason: String,
    proof: [ProofSchema],
    timeline: [TimelineSchema],
    resolvedAt: Date,
  },
  { timestamps: true }
);

ComplaintSchema.pre("save", async function () {
  if (!this.complaintId) {
    const year = new Date().getFullYear();
    const random = crypto.randomBytes(3).toString("hex").toUpperCase();
    this.complaintId = `UCMS-${year}-${random}`;
  }
});

const Complaint = mongoose.model("Complaint", ComplaintSchema);
export default Complaint;
