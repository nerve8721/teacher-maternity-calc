import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

/**
 * 👉  Generate an Input component that always carries bg‑card & border‑input styling.
 */
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      data-slot="input"
      className={cn(
        "flex h-9 w-full rounded-md bg-card border border-input px-3 py-1 text-base shadow-xs md:text-sm",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
});

interface PhaseRow {
  label: string;
  weeks: number;
  netPerWeek: number;
  netTotal: number;
}

export default function MaternityLeaveCalculator() {
  /* ──────────────────────── User inputs ──────────────────────── */
  const [annualSalary, setAnnualSalary] = useState(43_607);
  const [maternityStart, setMaternityStart] = useState("2025-10-06");
  const [easterStart, setEasterStart] = useState("2026-03-30");
  const [easterEnd, setEasterEnd] = useState("2026-04-17");
  const [mayStart, setMayStart] = useState("2026-05-25");
  const [mayEnd, setMayEnd] = useState("2026-05-31");
  const [summerStart, setSummerStart] = useState("2026-07-20");
  const [summerEnd, setSummerEnd] = useState("2026-08-30");

  /* ───────────────────────── Derived state ───────────────────────── */
  const [phaseRows, setPhaseRows] = useState<PhaseRow[] | null>(null);
  const [totals, setTotals] = useState<null | { normal: number; opt: number; gain: number }>(null);

  /* ─────────────────── Constants (tax year 2025‑26) ─────────────────── */
  const PA_WEEKLY = 12_570 / 52;
  const NI_PT = 242;
  const SMP = 184.03;
  const PENSION = 0.074;
  const TAX = 0.2;
  const NI = 0.12;
  const weeklySalary = annualSalary / 52.1429;

  /* ───────────────────── Helper fns ───────────────────── */
  const weeksBetween = (a: string, b: string) => Math.ceil((+new Date(b) - +new Date(a) + 1) / 604_800_000);
  const net = (g: number) => {
    const pension = g * PENSION;
    const tax = Math.max(0, g - pension - PA_WEEKLY) * TAX;
    const ni = Math.max(0, g - NI_PT) * NI;
    return +(g - pension - tax - ni).toFixed(2);
  };

  /* ───────────────────── Calc core ───────────────────── */
  const calculate = () => {
    const easter = weeksBetween(easterStart, easterEnd);
    const may = weeksBetween(mayStart, mayEnd);
    const summer = weeksBetween(summerStart, summerEnd);

    const [omp4, omp2, omp12, smp7, shpp5, shpp7] = [4, 2, 12, 7, 5, 7];
    const used = omp4 + omp2 + omp12 + smp7 + easter + shpp5 + may + shpp7 + summer;
    const shppRest = 52 - used;

    const phases: [string, number, number][] = [
      ["OMP full", omp4, weeklySalary],
      ["OMP 90%", omp2, weeklySalary * 0.9],
      ["OMP ½ + SMP", omp12, weeklySalary / 2 + SMP],
      ["SMP", smp7, SMP],
      ["Easter (full pay)", easter, weeklySalary],
      ["SPL 1 – ShPP", shpp5, SMP],
      ["May (full pay)", may, weeklySalary],
      ["SPL 2 – ShPP", shpp7, SMP],
      ["Summer (full pay)", summer, weeklySalary],
      ["SPL 3 – ShPP", shppRest, SMP],
    ];

    const rows = phases.map(([label, w, g]) => ({ label, weeks: w, netPerWeek: net(g), netTotal: +(net(g) * w).toFixed(2) }));
    const optTotal = rows.reduce((s, r) => s + r.netTotal, 0);
    const normalTotal = net(weeklySalary) * 4 + net(weeklySalary * 0.9) * 2 + net(weeklySalary / 2 + SMP) * 12 + net(SMP) * 21;

    setPhaseRows(rows);
    setTotals({ normal: normalTotal, opt: optTotal, gain: optTotal - normalTotal });
  };

  /* ───────────────────── JSX ───────────────────── */
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        {/* ─── Input card ─── */}
        <Card className="bg-card border border-border rounded-xl shadow">

          <CardContent className="p-6 space-y-6">
            <h1 className="text-2xl font-semibold text-center">Teacher Maternity &amp; SPL Pay Calculator</h1>

            {/* Salary & start date */}
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Annual salary (£)</span>
                <Input type="number" value={annualSalary} min={0} onChange={(e) => setAnnualSalary(+e.target.value)} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Maternity start date</span>
                <Input type="date" value={maternityStart} onChange={(e) => setMaternityStart(e.target.value)} />
              </label>
            </div>

            {/* Holiday dates */}
            <h2 className="text-lg font-semibold">Holiday / term‑break dates</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              <label className="flex flex-col gap-1"><span className="text-sm font-medium">Easter start</span><Input type="date" value={easterStart} onChange={(e) => setEasterStart(e.target.value)} /></label>
              <label className="flex flex-col gap-1"><span className="text-sm font-medium">Easter end</span><Input type="date" value={easterEnd} onChange={(e) => setEasterEnd(e.target.value)} /></label>
              <label className="flex flex-col gap-1"><span className="text-sm font-medium">May start</span><Input type="date" value={mayStart} onChange={(e) => setMayStart(e.target.value)} /></label>
              <label className="flex flex-col gap-1"><span className="text-sm font-medium">May end</span><Input type="date" value={mayEnd} onChange={(e) => setMayEnd(e.target.value)} /></label>
              <label className="flex flex-col gap-1"><span className="text-sm font-medium">Summer start</span><Input type="date" value={summerStart} onChange={(e) => setSummerStart(e.target.value)} /></label>
              <label className="flex flex-col gap-1"><span className="text-sm font-medium">Summer end</span><Input type="date" value={summerEnd} onChange={(e) => setSummerEnd(e.target.value)} /></label>
            </div>

            <Button className="mt-4 w-full md:w-auto" onClick={calculate}>
              Calculate
            </Button>
          </CardContent>
        </Card>

        {/* ─── Totals summary ─── */}
        {totals && (
<Card className="bg-card border border-border rounded-xl shadow">
            <CardContent className="p-6 grid gap-6">
              <h2 className="text-xl font-semibold text-center mb-2">Net pay summary (52 weeks)</h2>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-background border border-border">
                  <p className="font-medium">Normal maternity</p>
                  <p className="text-2xl font-bold">£{totals.normal.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-background border border-border">
                  <p className="font-medium">Optimised SPL plan</p>
                  <p className="text-2xl font-bold">£{totals.opt.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-background border border-border">
                  <p className="font-medium">Extra take‑home</p>
                  <p className="text-2xl font-bold">£{totals.gain.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Phase breakdown table ─── */}
        {phaseRows && (
<Card className="bg-card border border-border rounded-xl shadow">
            <CardContent className="p-4 overflow-x-auto">
              <h2 className="text-xl font-semibold mb-4 text-center">Phase‑by‑phase breakdown</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phase</TableHead>
                    <TableHead className="text-right">Weeks</TableHead>
                    <TableHead className="text-right">£ / week</TableHead>
                    <TableHead className="text-right">Total £</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {phaseRows.map((r) => (
                    <TableRow key={r.label} className="text-sm">
                      <TableCell>{r.label}</TableCell>
                      <TableCell className="text-right">{r.weeks}</TableCell>
                      <TableCell className="text-right">{r.netPerWeek.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">{r.netTotal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
