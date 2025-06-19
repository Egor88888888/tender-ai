import React, { useState, useEffect } from 'react'
import { Statistic } from 'antd'

interface AnimatedStatsProps {
  title: string
  value: number | string
  prefix?: React.ReactNode
  suffix?: string
  precision?: number
  valueStyle?: React.CSSProperties
  animate?: boolean
}

const AnimatedStats: React.FC<AnimatedStatsProps> = ({
  title,
  value,
  prefix,
  suffix,
  precision = 0,
  valueStyle,
  animate = true
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0)
  const numericValue = typeof value === 'number' ? value : 0

  useEffect(() => {
    if (!animate || typeof value !== 'number') {
      setDisplayValue(numericValue)
      return
    }

    const duration = 2000 // 2 секунды
    const steps = 60 // 60 кадров в секунду
    const increment = numericValue / steps
    let currentValue = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      currentValue += increment
      
      if (step >= steps || currentValue >= numericValue) {
        setDisplayValue(numericValue)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(currentValue))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, animate, numericValue])

  return (
    <Statistic
      title={title}
      value={typeof value === 'string' ? value : displayValue}
      prefix={prefix}
      suffix={suffix}
      precision={precision}
      valueStyle={{
        ...valueStyle,
        transition: 'all 0.3s ease',
        transform: animate ? 'scale(1)' : undefined,
      }}
    />
  )
}

export default AnimatedStats 