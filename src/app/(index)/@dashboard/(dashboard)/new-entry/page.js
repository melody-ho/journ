import getUserId from "@/(authentication)/_helpers/get-user-id";
import { headers } from "next/headers";
import ImageVideoForm from "./_client-components/image-video-form";
import TextForm from "./_client-components/text-form";

export default async function NewEntry() {
  const user = await getUserId(headers());
  return (
    <main>
      <h1>New Entry</h1>
      <TextForm user={user} />
      <ImageVideoForm user={user} />
    </main>
  );
}
