import Entry from "@/(dashboard)/entry/[id]/_components/entry";
import Modal from "@/app/_helper-components/modal";

export default async function EntryModal({ params }) {
  return (
    <Modal>
      <Entry id={params.id} />
    </Modal>
  );
}
