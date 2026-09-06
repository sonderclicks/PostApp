export function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function shiftMonth(month: string, delta: number) {
  const [year, mon] = month.split("-").map(Number);
  const date = new Date(year, mon - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonth(month: string) {
  const [year, mon] = month.split("-").map(Number);
  const date = new Date(year, mon - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
