import React from "react";
import PiList from "@/components/pi-list";

const page = () => {
  return (
    <div className="max-w-3xs mx-auto py-10 border border-xl">
      <div style={{ marginTop: 12 }}>
        <PiList chunkSize={1000} />
      </div>
    </div>
  );
};

export default page;
