// const enToBn = (value: string | number): string => {
//   const map: Record<string, string> = {
//     "0": "০",
//     "1": "১",
//     "2": "২",
//     "3": "৩",
//     "4": "৪",
//     "5": "৫",
//     "6": "৬",
//     "7": "৭",
//     "8": "৮",
//     "9": "৯",
//   };

//   return value
//     .toString()
//     .split("")
//     .map((char) => map[char] ?? char)
//     .join("");
// };
export const enToBn = (value: number | string): string => {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

  return value
    .toString()
    .replace(/\d/g, (digit) => banglaDigits[Number(digit)]);
};

type BnNumberProps = {
  value: string | number;
  className?: string;
};

export default function BnNumber({ value, className }: BnNumberProps) {
  return <span className={className}>{enToBn(value)}</span>;
}
