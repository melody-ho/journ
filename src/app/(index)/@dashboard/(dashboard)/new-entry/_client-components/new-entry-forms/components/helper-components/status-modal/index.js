import Link from "next/link";
import { useEffect, useRef } from "react";

export default function StatusModal({ resetForm, retry, status }) {
  const modal = useRef(null);

  useEffect(
    function openModal() {
      if (modal.current) {
        modal.current.close();
        modal.current.showModal();
      }
    },
    [modal],
  );

  return (
    <dialog ref={modal}>
      {status === "uploading" ? null : status === "loading" ? (
        <p>Adding new entry...</p>
      ) : status === "success" ? (
        <div>
          <p>Entry added!</p>
          <Link href="/">Back to dashboard</Link>
          <button onClick={resetForm} type="button">
            Add more
          </button>
        </div>
      ) : status === "error" ? (
        <div>
          <p>An error occured.</p>
          <button onClick={retry} type="button">
            Try again
          </button>
        </div>
      ) : null}
    </dialog>
  );
}
