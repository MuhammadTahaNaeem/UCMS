import mongoose from "mongoose";

const LogoSchema = new mongoose.Schema({
  public_id: String,
  url: String,
  originalName: String,
});

const SettingsSchema = new mongoose.Schema(
  {
    systemName: { type: String, default: "University Complaint Management System" },
    logo: LogoSchema,
    description: String,
    supportEmail: String,
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", SettingsSchema);
export default Settings;
