import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout, Menu, Typography, Space, Card, Statistic, Upload, Button, message } from 'antd'
import { 
  DashboardOutlined, 
  FileTextOutlined, 
  CloudUploadOutlined,
  BarChartOutlined,
  SettingOutlined,
  InboxOutlined
} from '@ant-design/icons'
import { useQuery } from 'react-query'
import axios from 'axios'

const { Header, Sider, Content } = Layout
const { Title, Text } = Typography
const { Dragger } = Upload

const API_BASE = import.meta.env.VITE_API_URL || '/api'

// API functions
const fetchApiStatus = async () => {
  const response = await axios.get(`${API_BASE}/`)
  return response.data
}

const fetchTenders = async () => {
  const response = await axios.get(`${API_BASE}/tenders`)
  return response.data
}

const uploadDocument = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axios.post(`${API_BASE}/upload-document`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

// Dashboard Component
const Dashboard: React.FC = () => {
  const { data: apiStatus } = useQuery('apiStatus', fetchApiStatus)
  const { data: tenders } = useQuery('tenders', fetchTenders)

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>Дашборд AI-Ассистента для Тендеров</Title>
      
      {/* Status Cards */}
      <Space size="large" wrap>
        <Card>
          <Statistic
            title="Статус API"
            value={apiStatus?.status === 'ok' ? 'Работает' : 'Недоступен'}
            valueStyle={{ color: apiStatus?.status === 'ok' ? '#3f8600' : '#cf1322' }}
          />
        </Card>
        
        <Card>
          <Statistic
            title="База данных"
            value={apiStatus?.features?.database ? 'Подключена' : 'Не настроена'}
            valueStyle={{ color: apiStatus?.features?.database ? '#3f8600' : '#cf1322' }}
          />
        </Card>
        
        <Card>
          <Statistic
            title="Azure OCR"
            value={apiStatus?.features?.computer_vision ? 'Активен' : 'Не настроен'}
            valueStyle={{ color: apiStatus?.features?.computer_vision ? '#3f8600' : '#cf1322' }}
          />
        </Card>
        
        <Card>
          <Statistic
            title="Gemini AI"
            value={apiStatus?.features?.gemini_ai ? 'Активен' : 'Не настроен'}
            valueStyle={{ color: apiStatus?.features?.gemini_ai ? '#3f8600' : '#cf1322' }}
          />
        </Card>
      </Space>

      {/* Azure Services Status */}
      <Card title="Статус Azure сервисов" style={{ width: '100%' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>Версия: {apiStatus?.version}</Text>
          <Text>Blob Storage: {apiStatus?.features?.blob_storage ? '✅ Работает' : '❌ Не настроен'}</Text>
          <Text>Form Recognizer: {apiStatus?.features?.form_recognizer ? '✅ Работает' : '❌ Не настроен'}</Text>
          <Text>Computer Vision: {apiStatus?.features?.computer_vision ? '✅ Работает' : '❌ Не настроен'}</Text>
        </Space>
      </Card>
    </Space>
  )
}

// Upload Component
const DocumentUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const result = await uploadDocument(file)
      setUploadResult(result)
      message.success(`Документ ${file.name} успешно загружен и обработан!`)
    } catch (error) {
      message.error('Ошибка при загрузке документа')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
    return false // Prevent default upload behavior
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>Загрузка документов</Title>
      
      <Card title="Загрузить документ тендера" style={{ width: '100%' }}>
        <Dragger
          name="file"
          multiple={false}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          beforeUpload={handleUpload}
          loading={uploading}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Нажмите или перетащите файл в эту область для загрузки</p>
          <p className="ant-upload-hint">
            Поддерживаются форматы: PDF, DOC, DOCX, JPG, PNG
          </p>
        </Dragger>
      </Card>

      {uploadResult && (
        <Card title="Результат обработки" style={{ width: '100%' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Файл: {uploadResult.filename}</Text>
            <Text>Размер: {Math.round(uploadResult.size / 1024)} KB</Text>
            {uploadResult.ocr_text && (
              <div>
                <Text strong>Распознанный текст:</Text>
                <div style={{ 
                  background: '#f5f5f5', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  marginTop: '8px',
                  maxHeight: '300px',
                  overflow: 'auto'
                }}>
                  <Text>{uploadResult.ocr_text}</Text>
                </div>
              </div>
            )}
          </Space>
        </Card>
      )}
    </Space>
  )
}

// Main App Component
const App: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('dashboard')

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Дашборд',
    },
    {
      key: 'upload',
      icon: <CloudUploadOutlined />,
      label: 'Загрузка документов',
    },
    {
      key: 'tenders',
      icon: <FileTextOutlined />,
      label: 'Тендеры',
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: 'Аналитика',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Настройки',
    },
  ]

  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return <Dashboard />
      case 'upload':
        return <DocumentUpload />
      case 'tenders':
        return <div>Раздел тендеров в разработке</div>
      case 'analytics':
        return <div>Раздел аналитики в разработке</div>
      case 'settings':
        return <div>Раздел настроек в разработке</div>
      default:
        return <Dashboard />
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={250}>
        <div style={{ padding: '16px', color: 'white', textAlign: 'center' }}>
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            Tender AI
          </Title>
          <Text style={{ color: '#888' }}>Azure Full Stack</Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onSelect={({ key }) => setSelectedKey(key)}
        />
      </Sider>
      
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <Title level={4} style={{ margin: '16px 0' }}>
            AI-Ассистент для анализа тендеров
          </Title>
        </Header>
        
        <Content style={{ margin: '24px', padding: '24px', background: '#fff' }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  )
}

export default App 