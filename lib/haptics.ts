const vibe = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined') navigator.vibrate?.(pattern)
}

export const haptics = {
  light:     () => vibe(8),
  medium:    () => vibe(20),
  heavy:     () => vibe(40),
  tab:       () => vibe(15),
  selection: () => vibe(6),
  success:   () => vibe([10, 60, 10]),
  error:     () => vibe([40, 30, 40]),
}
