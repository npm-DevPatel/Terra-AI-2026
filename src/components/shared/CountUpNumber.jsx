import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'

export default function CountUpNumber({ value, suffix = '', decimals = 0 }) {
  const animated = useAnimatedNumber(Math.round(value * Math.pow(10, decimals)), 1200)
  const display = decimals > 0
    ? (animated / Math.pow(10, decimals)).toFixed(decimals)
    : animated

  return (
    <span className="font-mono font-bold tabular-nums">
      {display}{suffix}
    </span>
  )
}
