import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, ReferenceLine, Tooltip,
} from 'recharts'
import Card from '../ui/Card'

// See ReadingLevelChart: recharts SVG text keeps literal hex (not CSS tokens).
const FONT = "'Nunito Sans', sans-serif"

/** WPM progression (line chart) with the Grade 4 target reference line. */
export default function WpmChart({ data, latestWpm, improvement }) {
  return (
    <Card className="p-[25px] flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-ink-soft text-[18px] leading-[28px] font-semibold">Words Per Minute</span>
          {latestWpm !== null && (
            <span className="text-brand text-[24px] leading-[32px] font-bold">{latestWpm} WPM</span>
          )}
        </div>
        {improvement !== null && (
          <div className="flex flex-col items-end">
            <span className="text-goal text-[12px] tracking-[0.96px] text-right leading-[16px] font-extrabold">
              {improvement >= 0 ? `+${improvement}%` : `${improvement}%`}
            </span>
            <span className="text-goal text-[12px] tracking-[0.96px] font-extrabold">IMPROVEMENT</span>
          </div>
        )}
      </div>
      <div className="bg-card rounded-[8px] p-4" style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#58413f', opacity: 0.6, fontFamily: FONT }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#58413f', fontFamily: FONT }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine
              y={90}
              stroke="#a5352d"
              strokeDasharray="4 4"
              label={{ value: 'Grade 4 Target', position: 'right', fontSize: 9, fill: '#a5352d', fontFamily: FONT }}
            />
            <Tooltip
              contentStyle={{
                background: '#a5352d',
                border: 'none',
                borderRadius: 6,
                color: '#fff',
                fontSize: 10,
                fontFamily: FONT,
                padding: '2px 8px',
              }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#fff' }}
            />
            <Line
              dataKey="wpm"
              stroke="#a5352d"
              strokeWidth={2}
              type="monotone"
              dot={{ fill: '#a5352d', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 4, fill: '#a5352d' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
