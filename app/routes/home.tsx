import { redirect } from "react-router";
import { isSignedIn } from "../lib/api/client";

// Every brand link points here, so where "home" is gets decided in one place.
export function clientLoader() {
  throw redirect(isSignedIn() ? "/lookup" : "/sign-in");
}

// Never rendered, since the loader always redirects.
export default function Home() {
  return null;
}
