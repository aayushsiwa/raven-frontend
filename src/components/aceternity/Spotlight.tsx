type SpotlightProps = {
  className?: string
}

export function Spotlight({ className }: SpotlightProps) {
  return <div aria-hidden className={`spotlight ${className ?? ''}`.trim()} />
}
