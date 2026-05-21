import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, ReferenceLine, Tooltip,
} from 'recharts'
import Card from '../ui/Card'

// Recharts renders axis ticks/labels as SVG <text> where fill/stroke are
// presentation attributes — CSS var() tokens don't resolve there, so chart
// colors stay as literal hex (the design-token source values).
const FONT = "'Nunito Sans', sans-serif"
const LEVEL_LABELS = { 3: 'Independent', 2: 'Instructional', 1: 'Frustration' }

function LevelTick({ x, y, payload }) {
  const colors = { 3: '#36663e', 2: '#58413f', 1: '#a5352d' }
  const weights = { 3: '400', 2: '400', 1: '700' }
  const label = LEVEL_LABELS[payload.value]
  if (!label) return null
  return (
    <text
      x={x} y={y} dy={4} textAnchor="end" fontSize={10}
      fill={colors[payload.value]} fontWeight={weights[payload.value]} fontFamily={FONT}
    >
      {label}
    </text>
  )
}

function LevelTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-brand text-white text-[9px] rounded-[6px] px-2 py-1 shadow">
      {LEVEL_LABELS[payload[0].value]}
    </div>
  )
}

/** Reading-level trend (step chart) across all sessions, with a GOAL line. */
export default function ReadingLevelChart({ data }) {
  return (
    <Card className="p-[25px] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-ink-soft text-[18px] leading-[28px] font-semibold">Reading Level</span>
        <span className="text-ink-soft text-[12px] tracking-[0.96px] opacity-60 font-extrabold">ALL SESSIONS</span>
      </div>
      <div className="bg-card rounded-[12px] p-4" style={{ height: 192 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#58413f', opacity: 0.6, fontFamily: FONT }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[1, 3]}
              ticks={[1, 2, 3]}
              tick={<LevelTick />}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <ReferenceLine
              y={3}
              stroke="#36663e"
              strokeDasharray="4 4"
              label={{ value: 'GOAL', position: 'right', fontSize: 10, fill: '#36663e', fontFamily: FONT }}
            />
            <Tooltip content={<LevelTooltip />} />
            <Line
              dataKey="level"
              stroke="#a5352d"
              strokeWidth={2}
              type="stepAfter"
              dot={{ fill: '#a5352d', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#a5352d' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
