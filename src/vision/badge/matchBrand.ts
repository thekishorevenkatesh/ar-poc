const BRANDS = [
  "HYUNDAI",
  "TATA",
  "SUZUKI",
  "MARUTI",
  "HONDA",
  "KIA",
  "MAHINDRA",
  "TOYOTA",
];

export function matchBrandFromText(
  text: string
): string | null {
  for (const brand of BRANDS) {
    if (text.includes(brand)) {
      return brand;
    }
  }
  return null;
}
