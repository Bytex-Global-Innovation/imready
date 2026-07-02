import * as yup from "yup";

export const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

export type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};
