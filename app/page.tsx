import React from "react";
import PiList from "@/components/pi-list";

const page = () => {
  return (
    <div className="max-w-3xs mx-auto py-10 border border-xl">
      {/* <p className="small">
        Digits of Pi (after the decimal point). Virtualized list + chunked
        server generation.
      </p> */}
      <div style={{ marginTop: 12 }}>
        <PiList chunkSize={1000} />
      </div>
    </div>
  );
};

export default page;
