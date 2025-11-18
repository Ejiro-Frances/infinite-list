import { NextRequest, NextResponse } from "next/server";

// Cache to store computed digits to avoid recalculation
const digitCache = new Map<number, string>();
let maxComputedDigits = 0;

// Set a reasonable maximum to prevent excessive computation
const MAX_DIGITS = 500000;

// Simple spigot algorithm for Pi (returns digits after decimal)
function computePiDigits(n: number): string {
  if (n <= 0) return "";

  // If we already computed at least n digits, try reading from cache
  if (maxComputedDigits >= n && digitCache.has(n)) {
    return digitCache.get(n)!;
  }

  const digits: number[] = [];
  const len = Math.floor((10 * n) / 3) + 16;
  const A: number[] = new Array(len).fill(2);

  let nines = 0;
  let predigit = 0;

  for (let j = 1; j <= n + 1; j++) {
    let q = 0;
    for (let i = len - 1; i > 0; i--) {
      const x = 10 * A[i] + q * i;
      A[i] = x % (2 * i + 1);
      q = Math.floor(x / (2 * i + 1));
    }
    A[0] = q % 10;
    q = Math.floor(q / 10);

    if (q === 9) {
      nines++;
    } else if (q === 10) {
      digits.push(predigit + 1);
      for (let k = 0; k < nines; k++) digits.push(0);
      predigit = 0;
      nines = 0;
    } else {
      if (j > 1) {
        digits.push(predigit);
      }
      predigit = q;
      for (let k = 0; k < nines; k++) digits.push(9);
      nines = 0;
    }
  }

  digits.push(predigit);

  // The first digit is the integer part '3'; strip it
  const result = digits.slice(1, n + 1).join("");

  // Cache result
  digitCache.set(n, result);
  maxComputedDigits = Math.max(maxComputedDigits, n);

  return result;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const start = Math.max(0, parseInt(searchParams.get("start") ?? "0", 10));
    const count = Math.min(
      5000,
      Math.max(1, parseInt(searchParams.get("count") ?? "1000", 10))
    );

    if (start >= MAX_DIGITS) {
      return NextResponse.json(
        { start, count: 0, digits: "" },
        { status: 200 }
      );
    }

    const totalNeeded = Math.min(start + count, MAX_DIGITS);

    const allDigits = computePiDigits(totalNeeded);

    const slice = allDigits.slice(start, start + count);

    return NextResponse.json(
      { start, count: slice.length, digits: slice },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      }
    );
  } catch (error) {
    console.error("Error computing Pi digits:", error);
    return NextResponse.json(
      { error: "Failed to compute Pi digits" },
      { status: 500 }
    );
  }
}
// import { NextRequest, NextResponse } from "next/server";

// // Cache to store computed digits to avoid recalculation
// const digitCache = new Map<number, string>();
// let maxComputedDigits = 0;

// // Set a reasonable maximum to prevent excessive computation
// const MAX_DIGITS = 500000;

// /**
//  * Simple spigot algorithm for Pi (Rabinowitz and Wagon method variant).
//  * Computes the first 'n' digits after the decimal point.
//  * @param n The number of digits after the decimal point to compute.
//  * @returns A string containing 'n' digits of Pi after the decimal point.
//  */
// function computePiDigits(n: number): string {
//   if (n <= 0 || n > MAX_DIGITS) return "";

//   // Check cache first
//   if (maxComputedDigits >= n && digitCache.has(n)) {
//     // Return the cached result (already containing n digits after the decimal)
//     return digitCache.get(n)!;
//   }

//   const digits: number[] = [];
//   // Calculate array length needed. The array stores the fractional part of the computation.
//   const len = Math.floor((10 * n) / 3) + 16;
//   const A: number[] = new Array(len).fill(2); // Initialize array

//   let nines = 0;
//   let predigit = 0;

//   for (let j = 1; j <= n; j++) {
//     let q = 0;
//     // Iterate over the array elements (right to left)
//     for (let i = len - 1; i > 0; i--) {
//       const x = 10 * A[i] + q * i;
//       A[i] = x % (2 * i + 1);
//       q = Math.floor(x / (2 * i + 1));
//     }

//     A[0] = q % 10;
//     q = Math.floor(q / 10);

//     // Logic to handle carries and the string of 9s
//     if (q === 9) {
//       nines++;
//     } else if (q === 10) {
//       // CARRY PROPAGATION FIX:
//       // When q=10, it means a carry occurred. We must propagate the carry
//       // backward through the digits array to flip 9s to 0s and increment the preceding digit.

//       // 1. Propagate carry back through the already-pushed digits, flipping 9s to 0s.
//       let k = digits.length - 1;
//       while (k >= 0 && digits[k] === 9) {
//         digits[k] = 0;
//         k--;
//       }

//       // 2. Increment the last non-9 digit found.
//       if (k >= 0) {
//         digits[k] += 1;
//       }

//       // 3. The digits accumulated as nines in the buffer must also be reset to 0.
//       for (let l = 0; l < nines; l++) {
//         digits.push(0);
//       }

//       // 4. Reset the buffer for the next digit.
//       predigit = 0;
//       nines = 0;
//     } else {
//       if (j > 1) {
//         digits.push(predigit);
//       }
//       predigit = q;
//       for (let k = 0; k < nines; k++) {
//         digits.push(9);
//       }
//       nines = 0;
//     }
//   }

//   // The final calculated predigit needs to be pushed
//   digits.push(predigit);

//   // The first calculated digit (index 0) is always 3.
//   // We use slice(1, n + 1) to get the 'n' digits *after* the initial 3.
//   const result = digits.slice(1, n + 1).join("");

//   // Cache the result
//   digitCache.set(n, result);
//   maxComputedDigits = Math.max(maxComputedDigits, n);

//   return result;
// }

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);

//     // 'start' is the offset (0-indexed) of the first digit *after* the decimal point.
//     const start = Math.max(0, parseInt(searchParams.get("start") ?? "0", 10));
//     // 'count' is the number of digits to return in this batch.
//     const count = Math.min(
//       5000, // Hard limit per request to prevent huge data transfer
//       Math.max(1, parseInt(searchParams.get("count") ?? "100", 10))
//     );

//     if (start >= MAX_DIGITS) {
//       // If we request beyond the limit, return an empty set but with 200 status
//       return NextResponse.json(
//         { start, count: 0, digits: "" },
//         { status: 200 }
//       );
//     }

//     // Calculate how many digits (total) we need to compute/retrieve from the cache
//     const totalNeeded = Math.min(start + count, MAX_DIGITS);

//     // Compute or retrieve the full string up to the required point
//     const allDigits = computePiDigits(totalNeeded);

//     // Extract the requested slice from the full string
//     const slice = allDigits.slice(start, start + count);

//     return NextResponse.json(
//       {
//         start,
//         count: slice.length,
//         digits: slice, // The digits string requested
//       },
//       {
//         status: 200,
//         headers: {
//           // Cache the response since Pi digits are immutable
//           "Cache-Control": "public, max-age=31536000, immutable",
//         },
//       }
//     );
//   } catch (error) {
//     console.error("Error computing Pi digits:", error);
//     return NextResponse.json(
//       { error: "Failed to compute Pi digits" },
//       { status: 500 }
//     );
//   }
// }
// // // app/api/pi/route.ts
// // import { NextRequest, NextResponse } from "next/server";

// // // Cache to store computed digits to avoid recalculation
// // const digitCache = new Map<number, string>();
// // let maxComputedDigits = 0;

// // // Simple spigot algorithm for Pi
// // function computePiDigits(n: number): string {
// //   if (n <= 0) return "";

// //   // Check cache first
// //   if (maxComputedDigits >= n && digitCache.has(n)) {
// //     return digitCache.get(n)!;
// //   }

// //   const digits: number[] = [];
// //   const len = Math.floor((10 * n) / 3) + 16;
// //   const A: number[] = new Array(len).fill(2);

// //   let nines = 0;
// //   let predigit = 0;

// //   for (let j = 1; j <= n; j++) {
// //     let q = 0;
// //     for (let i = len - 1; i > 0; i--) {
// //       const x = 10 * A[i] + q * i;
// //       A[i] = x % (2 * i + 1);
// //       q = Math.floor(x / (2 * i + 1));
// //     }
// //     A[0] = q % 10;
// //     q = Math.floor(q / 10);

// //     if (q === 9) {
// //       nines++;
// //     } else if (q === 10) {
// //       digits.push(predigit + 1);
// //       for (let k = 0; k < nines; k++) {
// //         digits.push(0);
// //       }
// //       predigit = 0;
// //       nines = 0;
// //     } else {
// //       if (j > 1) {
// //         digits.push(predigit);
// //       }
// //       predigit = q;
// //       for (let k = 0; k < nines; k++) {
// //         digits.push(9);
// //       }
// //       nines = 0;
// //     }
// //   }
// //   digits.push(predigit);

// //   // First digit is 3, rest are after decimal
// //   const result = digits.slice(1, n + 1).join("");

// //   // Cache it
// //   digitCache.set(n, result);
// //   maxComputedDigits = Math.max(maxComputedDigits, n);

// //   return result;
// // }

// // export async function GET(req: NextRequest) {
// //   try {
// //     const { searchParams } = new URL(req.url);

// //     const start = Math.max(0, parseInt(searchParams.get("start") ?? "0", 10));
// //     const count = Math.min(
// //       5000,
// //       Math.max(1, parseInt(searchParams.get("count") ?? "1000", 10))
// //     );

// //     // Set a reasonable maximum to prevent performance issues
// //     // Adjust this based on your server's capabilities
// //     const MAX_DIGITS = 500000;

// //     if (start >= MAX_DIGITS) {
// //       return NextResponse.json(
// //         { start, count: 0, digits: "" },
// //         { status: 200 }
// //       );
// //     }

// //     // Calculate how many digits we actually need
// //     const totalNeeded = Math.min(start + count, MAX_DIGITS);

// //     // Compute or retrieve from cache
// //     const allDigits = computePiDigits(totalNeeded);

// //     // Extract the requested slice
// //     const slice = allDigits.slice(start, start + count);

// //     return NextResponse.json(
// //       {
// //         start,
// //         count: slice.length,
// //         digits: slice,
// //       },
// //       {
// //         status: 200,
// //         headers: {
// //           "Cache-Control": "public, max-age=31536000, immutable",
// //         },
// //       }
// //     );
// //   } catch (error) {
// //     console.error("Error computing Pi digits:", error);
// //     return NextResponse.json(
// //       { error: "Failed to compute Pi digits" },
// //       { status: 500 }
// //     );
// //   }
// // }
// // // // app/api/pi/route.ts
// // // import { NextRequest, NextResponse } from "next/server";

// // // // Cache to store computed digits to avoid recalculation
// // // const digitCache = new Map<number, string>();
// // // let maxComputedDigits = 0;

// // // // Spigot algorithm for computing Pi digits (returns digits after decimal point only)
// // // function computePiDigits(n: number): string {
// // //   if (n <= 0) return "";

// // //   // Check if we already have these digits cached
// // //   if (maxComputedDigits >= n && digitCache.has(n)) {
// // //     return digitCache.get(n)!;
// // //   }

// // //   // We need to compute n+1 digits to get the decimal part
// // //   const totalDigits = n + 1;
// // //   const len = Math.floor((10 * totalDigits) / 3) + 2;
// // //   const a: number[] = new Array(len).fill(2);
// // //   let nines = 0;
// // //   let predigit = 0;
// // //   let result = "";
// // //   let isFirstDigit = true;

// // //   for (let j = 0; j < totalDigits; j++) {
// // //     let carry = 0;
// // //     for (let i = len - 1; i >= 0; i--) {
// // //       const x = a[i] * 10 + carry;
// // //       const q = Math.floor(x / (2 * i + 1));
// // //       a[i] = x % (2 * i + 1);
// // //       carry = q * i;
// // //     }
// // //     a[0] = carry % 10;
// // //     const q = Math.floor(carry / 10);

// // //     if (q === 9) {
// // //       nines++;
// // //     } else if (q === 10) {
// // //       result += (predigit + 1).toString();
// // //       for (let k = 0; k < nines; k++) result += "0";
// // //       predigit = 0;
// // //       nines = 0;
// // //     } else {
// // //       if (!isFirstDigit) {
// // //         result += predigit.toString();
// // //       }
// // //       predigit = q;
// // //       if (isFirstDigit) isFirstDigit = false;
// // //       for (let k = 0; k < nines; k++) result += "9";
// // //       nines = 0;
// // //     }
// // //   }

// // //   result += predigit.toString();

// // //   // Skip the first digit (the "3") and return only decimal digits
// // //   const finalResult = result.slice(1, n + 1);

// // //   // Cache the result
// // //   digitCache.set(n, finalResult);
// // //   maxComputedDigits = Math.max(maxComputedDigits, n);

// // //   return finalResult;
// // // }

// // // export async function GET(req: NextRequest) {
// // //   try {
// // //     const { searchParams } = new URL(req.url);

// // //     const start = Math.max(0, parseInt(searchParams.get("start") ?? "0", 10));
// // //     const count = Math.min(
// // //       5000,
// // //       Math.max(1, parseInt(searchParams.get("count") ?? "1000", 10))
// // //     );

// // //     // Set a reasonable maximum to prevent performance issues
// // //     // Adjust this based on your server's capabilities
// // //     const MAX_DIGITS = 500000;

// // //     if (start >= MAX_DIGITS) {
// // //       return NextResponse.json(
// // //         { start, count: 0, digits: "" },
// // //         { status: 200 }
// // //       );
// // //     }

// // //     // Calculate how many digits we actually need
// // //     const totalNeeded = Math.min(start + count, MAX_DIGITS);

// // //     // Compute or retrieve from cache
// // //     const allDigits = computePiDigits(totalNeeded);

// // //     // Extract the requested slice
// // //     const slice = allDigits.slice(start, start + count);

// // //     return NextResponse.json(
// // //       {
// // //         start,
// // //         count: slice.length,
// // //         digits: slice,
// // //       },
// // //       {
// // //         status: 200,
// // //         headers: {
// // //           "Cache-Control": "public, max-age=31536000, immutable",
// // //         },
// // //       }
// // //     );
// // //   } catch (error) {
// // //     console.error("Error computing Pi digits:", error);
// // //     return NextResponse.json(
// // //       { error: "Failed to compute Pi digits" },
// // //       { status: 500 }
// // //     );
// // //   }
// // // }

// // // // // app/api/pi/route.ts
// // // // import { NextRequest, NextResponse } from "next/server";

// // // // // Cache to store computed digits to avoid recalculation
// // // // const digitCache = new Map<number, string>();
// // // // let maxComputedDigits = 0;

// // // // // Spigot algorithm for computing Pi digits
// // // // function computePiDigits(n: number): string {
// // // //   if (n <= 0) return "";

// // // //   // Check if we already have these digits cached
// // // //   if (maxComputedDigits >= n && digitCache.has(n)) {
// // // //     return digitCache.get(n)!;
// // // //   }

// // // //   const len = Math.floor((10 * n) / 3) + 2;
// // // //   const a: number[] = new Array(len).fill(2);
// // // //   let nines = 0;
// // // //   let predigit = 0;
// // // //   let result = "";

// // // //   for (let j = 0; j < n; j++) {
// // // //     let carry = 0;
// // // //     for (let i = len - 1; i >= 0; i--) {
// // // //       const x = a[i] * 10 + carry;
// // // //       const q = Math.floor(x / (2 * i + 1));
// // // //       a[i] = x % (2 * i + 1);
// // // //       carry = q * i;
// // // //     }
// // // //     a[0] = carry % 10;
// // // //     const q = Math.floor(carry / 10);

// // // //     if (q === 9) {
// // // //       nines++;
// // // //     } else if (q === 10) {
// // // //       result += (predigit + 1).toString();
// // // //       for (let k = 0; k < nines; k++) result += "0";
// // // //       predigit = 0;
// // // //       nines = 0;
// // // //     } else {
// // // //       result += predigit.toString();
// // // //       predigit = q;
// // // //       for (let k = 0; k < nines; k++) result += "9";
// // // //       nines = 0;
// // // //     }
// // // //   }

// // // //   result += predigit.toString();
// // // //   const finalResult = result.slice(0, n);

// // // //   // Cache the result
// // // //   digitCache.set(n, finalResult);
// // // //   maxComputedDigits = Math.max(maxComputedDigits, n);

// // // //   return finalResult;
// // // // }

// // // // export async function GET(req: NextRequest) {
// // // //   try {
// // // //     const { searchParams } = new URL(req.url);

// // // //     const start = Math.max(0, parseInt(searchParams.get("start") ?? "0", 10));
// // // //     const count = Math.min(
// // // //       5000,
// // // //       Math.max(1, parseInt(searchParams.get("count") ?? "1000", 10))
// // // //     );

// // // //     // Set a reasonable maximum to prevent performance issues
// // // //     // Adjust this based on your server's capabilities
// // // //     const MAX_DIGITS = 500000;

// // // //     if (start >= MAX_DIGITS) {
// // // //       return NextResponse.json(
// // // //         { start, count: 0, digits: "" },
// // // //         { status: 200 }
// // // //       );
// // // //     }

// // // //     // Calculate how many digits we actually need
// // // //     const totalNeeded = Math.min(start + count, MAX_DIGITS);

// // // //     // Compute or retrieve from cache
// // // //     const allDigits = computePiDigits(totalNeeded);

// // // //     // Extract the requested slice
// // // //     const slice = allDigits.slice(start, start + count);

// // // //     return NextResponse.json(
// // // //       {
// // // //         start,
// // // //         count: slice.length,
// // // //         digits: slice,
// // // //       },
// // // //       {
// // // //         status: 200,
// // // //         headers: {
// // // //           "Cache-Control": "public, max-age=31536000, immutable",
// // // //         },
// // // //       }
// // // //     );
// // // //   } catch (error) {
// // // //     console.error("Error computing Pi digits:", error);
// // // //     return NextResponse.json(
// // // //       { error: "Failed to compute Pi digits" },
// // // //       { status: 500 }
// // // //     );
// // // //   }
// // // // }
// // // // // // Server route: returns a chunk of decimal digits of Pi starting at `start` (0-based, first digit after decimal is index 0)
// // // // // // Query params: start (integer), count (integer)

// // // // // import { NextRequest } from "next/server";

// // // // // export async function GET(req: NextRequest) {
// // // // //   const { searchParams } = new URL(req.url);

// // // // //   const start = Math.max(0, parseInt(searchParams.get("start") ?? "0", 10));
// // // // //   const count = Math.min(
// // // // //     5000,
// // // // //     Math.max(1, parseInt(searchParams.get("count") ?? "1000", 10))
// // // // //   );

// // // // //   // --- PI DIGIT GENERATOR (Spigot Algorithm) ---
// // // // //   function computePiDigits(n: number): string {
// // // // //     if (n <= 0) return "";

// // // // //     const len = Math.floor((10 * n) / 3) + 2;
// // // // //     const a: number[] = new Array(len).fill(2);
// // // // //     let nines = 0;
// // // // //     let predigit = 0;
// // // // //     let result = "";

// // // // //     for (let j = 0; j < n; j++) {
// // // // //       let carry = 0;
// // // // //       for (let i = len - 1; i >= 0; i--) {
// // // // //         const x = a[i] * 10 + carry;
// // // // //         const q = Math.floor(x / (2 * i + 1));
// // // // //         a[i] = x % (2 * i + 1);
// // // // //         carry = q * i;
// // // // //       }
// // // // //       a[0] = carry % 10;
// // // // //       const q = Math.floor(carry / 10);

// // // // //       if (q === 9) {
// // // // //         nines++;
// // // // //       } else if (q === 10) {
// // // // //         result += (predigit + 1).toString();
// // // // //         for (let k = 0; k < nines; k++) result += "0";
// // // // //         predigit = 0;
// // // // //         nines = 0;
// // // // //       } else {
// // // // //         result += predigit.toString();
// // // // //         predigit = q;
// // // // //         for (let k = 0; k < nines; k++) result += "9";
// // // // //         nines = 0;
// // // // //       }
// // // // //     }

// // // // //     result += predigit.toString();
// // // // //     return result.slice(0, n);
// // // // //   }

// // // // //   const totalNeeded = start + count;
// // // // //   const digits = computePiDigits(totalNeeded);
// // // // //   const slice = digits.slice(start, start + count);

// // // // //   return new Response(
// // // // //     JSON.stringify({ start, count: slice.length, digits: slice }),
// // // // //     {
// // // // //       status: 200,
// // // // //       headers: { "Content-Type": "application/json" },
// // // // //     }
// // // // //   );
// // // // // }
