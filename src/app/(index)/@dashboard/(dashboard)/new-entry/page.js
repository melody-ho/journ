import getUserId from "@/(authentication)/_helpers/get-user-id";
import { headers } from "next/headers";
import NewEntryForms from "./_client-components/new-entry-forms";

export default async function NewEntry() {
  const user = await getUserId(headers());
  return (
    <>
      <header>
        <h1>New Entry</h1>
      </header>
      <main>
        <NewEntryForms user={user} />
      </main>
    </>
  );
}
