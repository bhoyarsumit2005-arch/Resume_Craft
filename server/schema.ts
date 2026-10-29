import mongoose from "mongoose";
import type { Model, SchemaDefinitionProperty, Types } from "mongoose";
const { Schema, model, models } = mongoose;
import type {
  PersonalInfo,
  Education,
  Experience,
  Project,
  Certification,
  Achievement,
  Language,
  SocialLink,
  TemplateId,
  AccentColor,
  FontSize,
  FontFamily,
  SectionKey,
} from "../src/lib/resume-types";

export interface UserDoc {
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  registrationOtp?: string;
  registrationOtpExpiry?: Date;
  otp?: string;
  otpExpiry?: Date;
  /** Bumped on password change/reset — tokens with a lower version are rejected. */
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 255, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    registrationOtp: { type: String, default: undefined },
    registrationOtpExpiry: { type: Date, default: undefined },
    otp: { type: String, default: undefined },
    otpExpiry: { type: Date, default: undefined },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export interface ResumeDoc {
  userId: Types.ObjectId;
  title: string;
  template: TemplateId;
  accentColor: AccentColor;
  fontSize: FontSize;
  fontFamily: FontFamily;
  personalInfo: PersonalInfo;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: string[];
  certifications: Certification[];
  achievements: Achievement[];
  languages: Language[];
  socialLinks: SocialLink[];
  hiddenSections: SectionKey[];
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<ResumeDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, default: "Untitled Resume", maxlength: 160 },
    template: { type: String, required: true, default: "modern" },
    accentColor: { type: String, required: true, default: "blue" },
    fontSize: { type: String, required: true, default: "medium" },
    fontFamily: { type: String, required: true, default: "arial" },
    personalInfo: { type: Schema.Types.Mixed, required: true, default: {} },
    summary: { type: String, default: "" },
    education: { type: [Schema.Types.Mixed], default: [] } as SchemaDefinitionProperty<Education[]>,
    experience: { type: [Schema.Types.Mixed], default: [] } as SchemaDefinitionProperty<Experience[]>,
    projects: { type: [Schema.Types.Mixed], default: [] } as SchemaDefinitionProperty<Project[]>,
    skills: { type: [String], default: [] },
    certifications: { type: [Schema.Types.Mixed], default: [] } as SchemaDefinitionProperty<Certification[]>,
    achievements: { type: [Schema.Types.Mixed], default: [] } as SchemaDefinitionProperty<Achievement[]>,
    languages: { type: [Schema.Types.Mixed], default: [] } as SchemaDefinitionProperty<Language[]>,
    socialLinks: { type: [Schema.Types.Mixed], default: [] } as SchemaDefinitionProperty<SocialLink[]>,
    hiddenSections: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const users = (models.User as Model<UserDoc>) || model<UserDoc>("User", userSchema);
export const resumes = (models.Resume as Model<ResumeDoc>) || model<ResumeDoc>("Resume", resumeSchema);

export type UserRow = UserDoc & { _id: Types.ObjectId };
export type ResumeRow = ResumeDoc & { _id: Types.ObjectId };