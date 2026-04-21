// Russian plural rule: form depends on the last two digits.
//   1  → one   (1, 21, 31, …  except 11)
//   2-4 → few   (2-4, 22-24, …  except 12-14)
//   else → many
export function plural(n: number, one: string, few: string, many: string): string {
  const mod100 = Math.abs(n) % 100;
  const mod10 = mod100 % 10;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}
