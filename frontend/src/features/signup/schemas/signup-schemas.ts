import * as yup from "yup";
import { CAREER_DOORS } from "../constants/career-doors";

export const COUNTRY_CODES = [
  { code: "+1", label: "US +1" },
  { code: "+44", label: "UK +44" },
  { code: "+91", label: "IN +91" },
  { code: "+61", label: "AU +61" },
  { code: "+81", label: "JP +81" },
] as const;

export const COLLEGE_OPTIONS = [
  "Indian Institute of Technology (IIT) Bombay",
  "Indian Institute of Technology (IIT) Delhi",
  "Vellore Institute of Technology (VIT)",
  "Birla Institute of Technology and Science (BITS) Pilani",
  "Manipal Institute of Technology",
  "SRM Institute of Science and Technology",
  "PES University",
  "National Institute of Technology (NIT) Trichy",
  "Delhi Technological University (DTU)",
  "Other",
] as const;

export const STREAM_OPTIONS = [
  { value: "cse", label: "Computer Science & Engineering" },
  { value: "ece", label: "Electronics & Communication" },
  { value: "mechanical", label: "Mechanical Engineering" },
  { value: "civil", label: "Civil Engineering" },
  { value: "business", label: "Business Administration" },
  { value: "commerce", label: "Commerce & Finance" },
  { value: "design", label: "Design & Arts" },
  { value: "other", label: "Other" },
] as const;

export const GRADUATION_YEARS = [
  "2024",
  "2025",
  "2026",
  "2027",
  "2028",
  "2029",
  "2030",
] as const;

export const TARGET_DOMAINS = [
  { id: "ai", label: "Artificial Intelligence" },
  { id: "iot", label: "IoT" },
  { id: "operations", label: "Operations" },
  { id: "web-dev", label: "Web Dev" },
  { id: "finance", label: "Finance" },
  { id: "product", label: "Product" },
] as const;

const phoneRegex = /^[\d\s()-]{10,}$/;

export const personalInfoSchema = yup.object({
  fullName: yup
    .string()
    .trim()
    .required("Full name is required")
    .min(2, "Full name must be at least 2 characters"),
  email: yup
    .string()
    .trim()
    .required("Email address is required")
    .email("Please enter a valid email address"),
  countryCode: yup.string().required("Country code is required"),
  phone: yup
    .string()
    .trim()
    .required("Phone number is required")
    .matches(phoneRegex, "Please enter a valid phone number"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

export const academicDetailsSchema = yup.object({
  college: yup
    .string()
    .trim()
    .required("College or institution is required")
    .oneOf([...COLLEGE_OPTIONS], "Please select a valid college"),
  streamMajor: yup.string().required("Please select your stream or major"),
  graduationYear: yup
    .string()
    .required("Please select your year of graduation")
    .oneOf([...GRADUATION_YEARS], "Please select a valid graduation year"),
  targetDomain: yup
    .string()
    .required("Please select a target domain")
    .oneOf(
      TARGET_DOMAINS.map((domain) => domain.id),
      "Please select a valid target domain",
    ),
});

export const chooseDoorSchema = yup.object({
  careerDoor: yup
    .string()
    .required("Please choose a door to continue")
    .oneOf(
      CAREER_DOORS.map((door) => door.id),
      "Please choose a valid door",
    ),
  agreedToTerms: yup
    .boolean()
    .oneOf([true], "You must agree to the Terms of Service and Privacy Policy"),
});

export const signupSchema = personalInfoSchema
  .concat(academicDetailsSchema)
  .concat(chooseDoorSchema);

export type SignupFormValues = {
  fullName: string;
  email: string;
  countryCode: string;
  phone: string;
  password: string;
  confirmPassword: string;
  college: string;
  streamMajor: string;
  graduationYear: string;
  targetDomain: string;
  careerDoor: string;
  agreedToTerms: boolean;
};

export const SIGNUP_STEPS = [
  { id: 1, label: "Personal Info" },
  { id: 2, label: "Academic Details" },
  { id: 3, label: "Choose Your Door" },
] as const;

export const STEP_FIELDS: Record<number, (keyof SignupFormValues)[]> = {
  1: [
    "fullName",
    "email",
    "countryCode",
    "phone",
    "password",
    "confirmPassword",
  ],
  2: ["college", "streamMajor", "graduationYear", "targetDomain"],
  3: ["careerDoor", "agreedToTerms"],
};
