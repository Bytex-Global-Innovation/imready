import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

export default function SignupPage() {
  redirect(ROUTES.signupStep(1));
}
