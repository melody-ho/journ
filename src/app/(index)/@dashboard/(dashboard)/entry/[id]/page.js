import Entry from "./_components/entry";

export default function EntryPage({ params }) {
  return <Entry id={params.id} />;
}
