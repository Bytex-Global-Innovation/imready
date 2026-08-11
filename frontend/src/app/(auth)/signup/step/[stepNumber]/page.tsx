import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/** Old `/signup/step/*` URLs redirect to the single `/signup` route. */
export default function SignupStepRedirectPage() {
  redirect(ROUTES.signup);
}
