import { useRef, useState, useEffect, useMemo } from 'react'

interface UseProgressBarProps {
  progressTargetIdx: number
}

export function useProgressBar({ progressTargetIdx }: UseProgressBarProps) {
  const [stepWidths, setStepWidths] = useState<number[]>([])
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const stepsRowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!stepsRowRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      const widths = stepRefs.current.map((ref) => ref?.offsetWidth || 0)
      setStepWidths(widths)
    })

    resizeObserver.observe(stepsRowRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const progressBarWidth = useMemo(() => {
    if (stepWidths.length === 0) return 0

    const targetIndex = progressTargetIdx - 1
    if (targetIndex < 0 || targetIndex >= stepWidths.length) return 0

    let cumulativeWidth = 0
    for (let i = 0; i < targetIndex; i++) {
      cumulativeWidth += stepWidths[i] || 0
      if (i < targetIndex - 1) {
        cumulativeWidth += 80 // gap between steps
      }
    }
    cumulativeWidth += (stepWidths[targetIndex] || 0) / 2

    return cumulativeWidth
  }, [stepWidths, progressTargetIdx])

  return {
    stepRefs,
    stepsRowRef,
    progressBarWidth
  }
}
