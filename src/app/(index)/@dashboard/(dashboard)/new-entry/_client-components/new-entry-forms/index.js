"use client";

import ImageVideoForm from "./components/image-video-form";
import TextForm from "./components/text-form";
import { useState } from "react";

export default function NewEntryForms({ user }) {
  const [formShown, setFormShown] = useState("text");

  function showTextForm() {
    setFormShown("text");
  }

  function showImageVideoForm() {
    setFormShown("imageVideo");
  }

  return (
    <>
      <nav>
        <button onClick={showTextForm} type="button">
          Text
        </button>
        <button onClick={showImageVideoForm} type="button">
          Images/Videos
        </button>
      </nav>
      <section hidden={formShown !== "text"}>
        <TextForm user={user} />
      </section>
      <section hidden={formShown !== "imageVideo"}>
        <ImageVideoForm user={user} />
      </section>
    </>
  );
}
