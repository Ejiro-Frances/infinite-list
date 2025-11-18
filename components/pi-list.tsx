"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Virtuoso } from "react-virtuoso";

interface PiListProps {
  chunkSize?: number;
}

export default function PiList({ chunkSize = 1000 }: PiListProps) {
  const [digits, setDigits] = useState<string[]>(["3", "."]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const offsetRef = useRef<number>(0);
  const loadingRef = useRef<boolean>(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/pi?start=${offsetRef.current}&count=${chunkSize}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const json: { digits: string } = await res.json();
      const newDigits = json.digits.split("");

      if (newDigits.length === 0) {
        setHasMore(false);
      } else {
        setDigits((prev) => [...prev, ...newDigits]);
        offsetRef.current += newDigits.length;
      }
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [chunkSize, hasMore]);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  const itemContent = (index: number) => {
    const d = digits[index];
    if (!d) {
      return <div className="small">...</div>;
    }

    // Show position labels
    let label = "";
    if (index === 0) {
      label = ""; // The "3"
    } else if (index === 1) {
      label = ""; // The decimal point
    } else {
      label = `${index - 2}`; // Decimal positions (0, 1, 2, 3...)
    }

    return (
      <div className="small" title={`Position ${index}`}>
        <span style={{ width: 70, display: "inline-block", color: "#666" }}>
          {label}
        </span>
        <span style={{ fontFamily: "monospace", fontSize: "16px" }}>{d}</span>
      </div>
    );
  };

  return (
    <div>
      <div style={{ height: 600 }}>
        <Virtuoso
          style={{ height: "100%" }}
          data={digits}
          endReached={() => {
            if (hasMore && !loading) {
              loadMore();
            }
          }}
          itemContent={itemContent}
          overscan={200}
        />
      </div>
      <div className="loader" style={{ padding: "10px", textAlign: "center" }}>
        {loading
          ? "Loading more digits…"
          : hasMore
            ? "Scroll to load more"
            : "No more digits available"}
      </div>
    </div>
  );
}
// "use client";

// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { Virtuoso } from "react-virtuoso";

// interface PiListProps {
//   chunkSize?: number;
// }

// export default function PiList({ chunkSize = 1000 }: PiListProps) {
//   const [digits, setDigits] = useState<string[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [hasMore, setHasMore] = useState<boolean>(true);
//   const offsetRef = useRef<number>(0);
//   const loadingRef = useRef<boolean>(false);

//   const loadMore = useCallback(async () => {
//     if (loadingRef.current || !hasMore) return;
//     loadingRef.current = true;
//     setLoading(true);
//     try {
//       const res = await fetch(
//         `/api/pi?start=${offsetRef.current}&count=${chunkSize}`
//       );
//       if (!res.ok) throw new Error("Failed to fetch");
//       const json: { digits: string } = await res.json();
//       const newDigits = json.digits.split("");

//       if (newDigits.length === 0) {
//         setHasMore(false);
//       } else {
//         setDigits((prev) => [...prev, ...newDigits]);
//         offsetRef.current += newDigits.length;
//       }
//     } catch (err) {
//       console.error(err);
//       setHasMore(false);
//     } finally {
//       loadingRef.current = false;
//       setLoading(false);
//     }
//   }, [chunkSize, hasMore]);

//   useEffect(() => {
//     loadMore();
//   }, [loadMore]);

//   const itemContent = (index: number) => {
//     const d = digits[index];
//     if (!d) {
//       return <div className="small">...</div>;
//     }
//     return (
//       <div className="small" title={`Digit #${index}`}>
//         <span style={{ width: 70, display: "inline-block" }}>{index}.</span>
//         <span style={{ fontFamily: "monospace" }}>{d}</span>
//       </div>
//     );
//   };

//   return (
//     <div>
//       <div style={{ height: 600 }}>
//         <Virtuoso
//           style={{ height: "100%" }}
//           data={digits}
//           endReached={() => {
//             if (hasMore && !loading) {
//               loadMore();
//             }
//           }}
//           itemContent={itemContent}
//           overscan={200}
//         />
//       </div>
//       <div className="loader">
//         {loading
//           ? "Loading more digits…"
//           : hasMore
//             ? "Scroll to load more"
//             : "No more digits available"}
//       </div>
//     </div>
//   );
// }
