import { EarlyBirdIcon, StreakIcon, PerfectIcon } from '../icons'

// Decorative placeholders — no achievement data model yet (out of scope, REA-27).
const badges = [
  { label: 'Early Bird', iconBg: '#f4dfcc', Icon: EarlyBirdIcon },
  { label: '5-Day\nStreak', iconBg: '#baf0bc', Icon: StreakIcon },
  { label: 'Perfect\nRecog.', iconBg: '#ffdad6', Icon: PerfectIcon },
]

export default function AchievementsSection() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-ink text-[24px] leading-[32px] font-bold">Achievements</h2>
      <div className="grid grid-cols-3 gap-4">
        {badges.map(({ label, iconBg, Icon }) => (
          <div
            key={label}
            className="bg-badge-bg border border-card-border rounded-[12px] p-[17px] flex flex-col items-center gap-2"
          >
            <div
              className="size-[56px] rounded-full flex items-center justify-center"
              style={{ backgroundColor: iconBg }}
            >
              <Icon />
            </div>
            <span className="text-[#524436] text-[12px] tracking-[0.96px] text-center leading-[15px] whitespace-pre-line font-extrabold">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
