import React from 'react'
import { Badge, Tooltip } from 'antd'
import { CheckCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined, StopOutlined } from '@ant-design/icons'

interface StatusIndicatorProps {
  status: 'success' | 'error' | 'warning' | 'processing' | 'default'
  text?: string
  tooltip?: string
  showIcon?: boolean
  pulse?: boolean
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  text,
  tooltip,
  showIcon = true,
  pulse = false
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          color: '#52c41a',
          icon: <CheckCircleOutlined />,
          badgeStatus: 'success' as const,
          text: text || 'Успешно'
        }
      case 'error':
        return {
          color: '#ff4d4f',
          icon: <ExclamationCircleOutlined />,
          badgeStatus: 'error' as const,
          text: text || 'Ошибка'
        }
      case 'warning':
        return {
          color: '#faad14',
          icon: <ExclamationCircleOutlined />,
          badgeStatus: 'warning' as const,
          text: text || 'Предупреждение'
        }
      case 'processing':
        return {
          color: '#1890ff',
          icon: <ClockCircleOutlined />,
          badgeStatus: 'processing' as const,
          text: text || 'Обработка'
        }
      default:
        return {
          color: '#d9d9d9',
          icon: <StopOutlined />,
          badgeStatus: 'default' as const,
          text: text || 'Неактивно'
        }
    }
  }

  const config = getStatusConfig()

  const indicator = (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 8,
      animation: pulse ? 'pulse 2s infinite' : undefined
    }}>
      <Badge status={config.badgeStatus} />
      {showIcon && (
        <span style={{ color: config.color, fontSize: 16 }}>
          {config.icon}
        </span>
      )}
      <span style={{ 
        color: config.color, 
        fontWeight: 500,
        fontSize: 14
      }}>
        {config.text}
      </span>
    </div>
  )

  if (tooltip) {
    return (
      <Tooltip title={tooltip}>
        {indicator}
      </Tooltip>
    )
  }

  return indicator
}

export default StatusIndicator 