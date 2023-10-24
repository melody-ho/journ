"use client";

import Filters from "./filters";
import FilteredEntries from "./filtered-entries";
import { useState } from "react";

export default function Entries({ userId, userTags }) {
  const [checkedTags, setCheckedTags] = useState([]);

  function getFilters(data) {
    setCheckedTags(data.getAll("tags"));
  }

  return (
    <>
      <Filters passFilters={getFilters} userTags={userTags} />
      <FilteredEntries checkedTags={checkedTags} userId={userId} />
    </>
  );
}
