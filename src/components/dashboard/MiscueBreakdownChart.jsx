import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import Card from '../ui/Card'
import { InfoIcon } from '../icons'
import { miscueTotals } from '../../lib/dashboardStats'

/**
 * Miscue Breakdown (REA-33 · RR-049) — Figma "My Profile" node 5:458.
 *
 * Recharts bar chart of CUMULATIVE miscue totals across ALL of the learner's
 * sessions (not just the latest). Only types that have occurred are shown, most
 * → least frequent. Horizontal layout (categories on the Y-axis) so the full
 * plural labels stay readable on a 360px phone without horizontal scroll.
 *
 * Consumes the shared useSessionHistory() shape — the full `sessions` array.
 */

// Recharts renders axis ticks as SVG <text>; CSS var() tokens don't resolve
// there, so chart colours stay as the literal design-token hex values.
const FONT = "'Nunito Sans', sans-serif"

export default function MiscueBreakdownChart({ sessions }) {
  const data = miscueTotals(sessions)

  return (
    <Card className="p-[25px] flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-ink-soft text-[18px] leading-[28px] font-semibold">Miscue Breakdown</h2>
        <InfoIcon />
      </div>

      {data.length === 0 ? (
        <p className="text-ink-soft text-[14px] leading-[20px]">No miscues recorded yet.</p>
      ) : (
        <div className="bg-card rounded-[8px] p-3" style={{ height: Math.max(160, data.length * 42) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 10, fill: '#58413f', fontFamily: FONT }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                interval={0}
                tick={{ fontSize: 10, fill: '#58413f', fontFamily: FONT }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(165,53,45,0.06)' }}
                contentStyle={{ background: '#a5352d', border: 'none', borderRadius: 6, color: '#fff', fontSize: 10, fontFamily: FONT, padding: '2px 8px' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="total" name="Total" fill="#a5352d" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
