import React from 'react'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large'
  tip?: string
  spinning?: boolean
  children?: React.ReactNode
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'default', 
  tip = 'Загрузка...', 
  spinning = true,
  children 
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 32 : 24 }} spin />

  if (children) {
    return (
      <Spin 
        indicator={antIcon} 
        spinning={spinning} 
        tip={tip}
        size={size}
      >
        {children}
      </Spin>
    )
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '60px 20px',
      minHeight: '200px'
    }}>
      <Spin 
        indicator={antIcon} 
        size={size}
        style={{ marginBottom: 16 }}
      />
      <div style={{ 
        color: '#666', 
        fontSize: 16, 
        fontWeight: 500 
      }}>
        {tip}
      </div>
    </div>
  )
}

export default LoadingSpinner 