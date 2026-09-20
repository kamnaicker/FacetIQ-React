import { useNavigate } from "react-router";
import { useNotify } from "../components/ui/toast";
import { signOut } from "./api/client";

/** Shared so every way out ends the same: token cleared, a notice, then the sign in page. */
export function useSignOut(): () => void {
  const navigate = useNavigate();
  const notify = useNotify();

  return () => {
    signOut();
    notify("success", "Signed out.");
    navigate("/sign-in");
  };
}
