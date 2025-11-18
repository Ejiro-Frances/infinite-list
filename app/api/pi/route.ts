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
