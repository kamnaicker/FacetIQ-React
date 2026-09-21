import { redirect } from "react-router";
import { isSignedIn, listClaims } from "../lib/api/client";

// Every brand link points here, and signing in sends people here too, so where "home" is gets
// decided in one place. An account holding nothing cannot look anybody up yet and has never been
// told what the app is for, so it starts on the welcome page. Anything else, a failure included,
// goes where it always went.
export async function clientLoader() {
  if (!isSignedIn()) {
    throw redirect("/sign-in");
  }

  const claims = await listClaims();

  throw redirect(claims.ok && claims.data.length === 0 ? "/welcome" : "/lookup");
}

// Never rendered, since the loader always redirects.
export default function Home() {
  return null;
}
