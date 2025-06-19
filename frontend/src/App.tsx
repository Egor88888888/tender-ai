import React, { useState, useEffect } from 'react'
import { 
  Layout, 
  Menu, 
  Typography, 
  Space, 
  Card, 
  Statistic, 
  Upload, 
  Button, 
  message, 
  Progress,
  Table,
  Tag,
  Avatar,
  Badge,
  Tooltip,
  Row,
  Col,
  Spin,
  notification
} from 'antd'
import { 
  DashboardOutlined, 
  FileTextOutlined, 
  CloudUploadOutlined,
  BarChartOutlined,
  SettingOutlined,
  InboxOutlined,
  UserOutlined,
  BellOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  CloudServerOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  EyeOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import { useQuery, useMutation } from 'react-query'
import axios from 'axios'

const { Header, Sider, Content } = Layout
const { Title, Text, Paragraph } = Typography
const { Dragger } = Upload

const API_BASE = import.meta.env.VITE_API_URL || 'https://tender-api.bravesmoke-248b9fb5.westeurope.azurecontainerapps.io'

// API functions
const fetchApiStatus = async () => {
  const response = await axios.get(`${API_BASE}/`)
  return response.data
}

const fetchTenders = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/tenders`)
    return response.data
  } catch (error) {
    return []
  }
}

const uploadDocument = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axios.post(`${API_BASE}/api/upload-document`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

const analyzeWithAI = async (text: string) => {
  const response = await axios.post(`${API_BASE}/api/analyze-tender`, { text })
  return response.data
}

// Enhanced Dashboard Component
const Dashboard: React.FC = () => {
  const { data: apiStatus, isLoading: statusLoading } = useQuery('apiStatus', fetchApiStatus, {
    refetchInterval: 30000,
  })
  const { data: tenders, isLoading: tendersLoading } = useQuery('tenders', fetchTenders)

  const getStatusColor = (isActive: boolean) => isActive ? '#52c41a' : '#ff4d4f'
  const getStatusText = (isActive: boolean) => isActive ? 'Активен' : 'Неактивен'

  const serviceCards = [
    {
      title: 'API Статус',
      value: apiStatus?.status === 'ok' ? 'Работает' : 'Недоступен',
      icon: <CloudServerOutlined style={{ fontSize: 24 }} />,
      color: apiStatus?.status === 'ok' ? '#52c41a' : '#ff4d4f',
      loading: statusLoading
    },
    {
      title: 'Blob Storage',
      value: getStatusText(apiStatus?.features?.blob_storage),
      icon: <SafetyCertificateOutlined style={{ fontSize: 24 }} />,
      color: getStatusColor(apiStatus?.features?.blob_storage),
      loading: statusLoading
    },
    {
      title: 'Gemini AI',
      value: getStatusText(apiStatus?.features?.gemini_ai),
      icon: <RobotOutlined style={{ fontSize: 24 }} />,
      color: getStatusColor(apiStatus?.features?.gemini_ai),
      loading: statusLoading
    },
    {
      title: 'OCR Vision',
      value: getStatusText(apiStatus?.features?.computer_vision),
      icon: <EyeOutlined style={{ fontSize: 24 }} />,
      color: getStatusColor(apiStatus?.features?.computer_vision),
      loading: statusLoading
    }
  ]

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0, background: 'linear-gradient(135deg, #1890ff, #722ed1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🚀 Дашборд AI-Ассистента для Тендеров
        </Title>
        <Paragraph style={{ fontSize: 16, color: '#666', marginTop: 8 }}>
          Полнофункциональная платформа анализа тендеров на базе Azure
        </Paragraph>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {serviceCards.map((service, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              hoverable
              style={{
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0',
                transition: 'all 0.3s ease'
              }}
              bodyStyle={{ padding: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: service.color, marginBottom: 8 }}>
                    {service.icon}
                  </div>
                  <Statistic
                    title={service.title}
                    value={service.loading ? 'Загрузка...' : service.value}
                    valueStyle={{ 
                      color: service.color, 
                      fontSize: 16, 
                      fontWeight: 600 
                    }}
                    prefix={service.loading ? <LoadingOutlined /> : null}
                  />
                </div>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: `${service.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {service.loading ? <Spin /> : service.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ThunderboltOutlined style={{ color: '#1890ff' }} />
                Информация о системе
              </div>
            }
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Версия API"
                  value={apiStatus?.version || 'Загрузка...'}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Всего тендеров"
                  value={tendersLoading ? 'Загрузка...' : (tenders?.length || 0)}
                  prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                />
              </Col>
            </Row>
            
            <div style={{ marginTop: 24 }}>
              <Title level={5}>Активные сервисы Azure:</Title>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.entries(apiStatus?.features || {}).map(([key, value]) => (
                  <Tag
                    key={key}
                    color={value ? 'success' : 'error'}
                    icon={value ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                    style={{ padding: '4px 12px', borderRadius: 20 }}
                  >
                    {key.replace('_', ' ').toUpperCase()}
                  </Tag>
                ))}
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BellOutlined style={{ color: '#fa8c16' }} />
                Быстрые действия
              </div>
            }
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button 
                type="primary" 
                icon={<CloudUploadOutlined />} 
                size="large" 
                block
                style={{ borderRadius: 8, height: 48 }}
                onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'upload' }))}
              >
                Загрузить документ
              </Button>
              <Button 
                icon={<BarChartOutlined />} 
                size="large" 
                block
                style={{ borderRadius: 8, height: 48 }}
                onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'analytics' }))}
              >
                Посмотреть аналитику
              </Button>
              <Button 
                icon={<FileTextOutlined />} 
                size="large" 
                block
                style={{ borderRadius: 8, height: 48 }}
                onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'tenders' }))}
              >
                Все тендеры
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

// Enhanced Upload Component
const DocumentUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)

  const uploadMutation = useMutation(uploadDocument, {
    onSuccess: (data) => {
      setUploadResult(data)
      notification.success({
        message: 'Документ загружен!',
        description: 'Документ успешно обработан и готов к анализу',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      })
    },
    onError: () => {
      notification.error({
        message: 'Ошибка загрузки',
        description: 'Не удалось загрузить документ. Попробуйте еще раз.'
      })
    }
  })

  const aiAnalyzeMutation = useMutation(analyzeWithAI, {
    onSuccess: (data) => {
      setAiResult(data)
      notification.success({
        message: 'AI анализ завершен!',
        description: 'Получены рекомендации по тендеру',
        icon: <RobotOutlined style={{ color: '#1890ff' }} />
      })
    }
  })

  const handleUpload = async (file: File) => {
    setUploading(true)
    setProgress(0)
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const result = await uploadMutation.mutateAsync(file)
      setProgress(100)
      setTimeout(() => setProgress(0), 1000)
    } catch (error) {
      setProgress(0)
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
      clearInterval(interval)
    }
    return false
  }

  const handleAIAnalyze = () => {
    if (uploadResult?.ocr_text) {
      setAiAnalyzing(true)
      aiAnalyzeMutation.mutate(uploadResult.ocr_text)
      setTimeout(() => setAiAnalyzing(false), 2000)
    }
  }

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0 }}>
          📄 Загрузка и анализ документов
        </Title>
        <Paragraph style={{ fontSize: 16, color: '#666', marginTop: 8 }}>
          Загрузите документы тендеров для автоматического извлечения текста и AI-анализа
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CloudUploadOutlined style={{ color: '#1890ff' }} />
                Загрузка документа
              </div>
            }
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <Dragger
              name="file"
              multiple={false}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              beforeUpload={handleUpload}
              showUploadList={false}
              style={{
                borderRadius: 8,
                border: '2px dashed #d9d9d9',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ padding: '40px 20px' }}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                </p>
                <p className="ant-upload-text" style={{ fontSize: 18, fontWeight: 600 }}>
                  Нажмите или перетащите файл сюда
                </p>
                <p className="ant-upload-hint" style={{ fontSize: 14, color: '#666' }}>
                  Поддерживаются: PDF, DOC, DOCX, JPG, PNG (макс. 10MB)
                </p>
              </div>
            </Dragger>
            
            {uploading && (
              <div style={{ marginTop: 16 }}>
                <Progress 
                  percent={progress} 
                  status="active"
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
                <Text style={{ color: '#666' }}>Загрузка и обработка...</Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          {uploadResult ? (
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  Результат обработки
                </div>
              }
              style={{
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              extra={
                <Button
                  type="primary"
                  icon={<RobotOutlined />}
                  loading={aiAnalyzing}
                  onClick={handleAIAnalyze}
                  disabled={!uploadResult?.ocr_text}
                >
                  AI Анализ
                </Button>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <Text strong>Файл: </Text>
                  <Text>{uploadResult.filename}</Text>
                </div>
                <div>
                  <Text strong>Размер: </Text>
                  <Text>{Math.round(uploadResult.size / 1024)} KB</Text>
                </div>
                {uploadResult.ocr_text && (
                  <div>
                    <Text strong>Извлеченный текст:</Text>
                    <div style={{ 
                      background: '#f8f9fa', 
                      padding: '16px', 
                      borderRadius: '8px', 
                      marginTop: '8px',
                      maxHeight: '200px',
                      overflow: 'auto',
                      border: '1px solid #e9ecef'
                    }}>
                      <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
                        {uploadResult.ocr_text.substring(0, 500)}
                        {uploadResult.ocr_text.length > 500 && '...'}
                      </Text>
                    </div>
                  </div>
                )}
              </Space>
            </Card>
          ) : (
            <Card
              style={{
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                background: '#fafafa',
                border: '1px dashed #d9d9d9'
              }}
            >
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <FileTextOutlined style={{ fontSize: 48, color: '#bfbfbf', marginBottom: 16 }} />
                <Title level={4} style={{ color: '#bfbfbf' }}>
                  Загрузите документ для анализа
                </Title>
                <Text style={{ color: '#999' }}>
                  Результаты обработки появятся здесь
                </Text>
              </div>
            </Card>
          )}
        </Col>
      </Row>

      {aiResult && (
        <div style={{ marginTop: 24 }}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RobotOutlined style={{ color: '#722ed1' }} />
                AI Анализ тендера
              </div>
            }
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #722ed1'
            }}
          >
            <div style={{ 
              background: 'linear-gradient(135deg, #f6f8ff, #fff0f6)', 
              padding: '20px', 
              borderRadius: '8px',
              border: '1px solid #f0f0f0'
            }}>
              <Text style={{ fontSize: 16, lineHeight: 1.8 }}>
                {aiResult.analysis || 'Анализ завершен. Рекомендации готовы.'}
              </Text>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// Enhanced Tenders List Component
const TendersList: React.FC = () => {
  const { data: tenders, isLoading } = useQuery('tenders', fetchTenders)

  const columns = [
    {
      title: 'Номер тендера',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Tag color="blue">#{id}</Tag>
    },
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <Text strong>{title || 'Без названия'}</Text>
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : status === 'pending' ? 'warning' : 'default'}>
          {status?.toUpperCase() || 'НОВЫЙ'}
        </Tag>
      )
    },
    {
      title: 'Дата создания',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => date ? new Date(date).toLocaleDateString('ru-RU') : 'Сегодня'
    },
    {
      title: 'Действия',
      key: 'actions',
      render: () => (
        <Space>
          <Button icon={<EyeOutlined />} size="small">Просмотр</Button>
          <Button icon={<DownloadOutlined />} size="small">Скачать</Button>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0 }}>
          📋 Управление тендерами
        </Title>
        <Paragraph style={{ fontSize: 16, color: '#666', marginTop: 8 }}>
          Просматривайте и управляйте всеми загруженными тендерами
        </Paragraph>
      </div>

      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
        extra={
          <Button type="primary" icon={<CloudUploadOutlined />}>
            Добавить тендер
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tenders || []}
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Всего ${total} тендеров`
          }}
          locale={{
            emptyText: (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <FileTextOutlined style={{ fontSize: 48, color: '#bfbfbf', marginBottom: 16 }} />
                <div>
                  <Title level={4} style={{ color: '#bfbfbf' }}>Тендеры не найдены</Title>
                  <Text style={{ color: '#999' }}>Загрузите первый документ для начала работы</Text>
                </div>
              </div>
            )
          }}
        />
      </Card>
    </div>
  )
}

// Main App Component
const App: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const handleNavigate = (event: any) => {
      setSelectedKey(event.detail)
    }
    window.addEventListener('navigate', handleNavigate)
    return () => window.removeEventListener('navigate', handleNavigate)
  }, [])

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
        return <TendersList />
      case 'analytics':
        return (
          <div style={{ padding: '0 24px', textAlign: 'center', paddingTop: '100px' }}>
            <BarChartOutlined style={{ fontSize: 72, color: '#bfbfbf', marginBottom: 24 }} />
            <Title level={3} style={{ color: '#bfbfbf' }}>Аналитика в разработке</Title>
            <Paragraph style={{ color: '#999', fontSize: 16 }}>
              Здесь будут отображаться графики и статистика по тендерам
            </Paragraph>
          </div>
        )
      case 'settings':
        return (
          <div style={{ padding: '0 24px', textAlign: 'center', paddingTop: '100px' }}>
            <SettingOutlined style={{ fontSize: 72, color: '#bfbfbf', marginBottom: 24 }} />
            <Title level={3} style={{ color: '#bfbfbf' }}>Настройки в разработке</Title>
            <Paragraph style={{ color: '#999', fontSize: 16 }}>
              Здесь можно будет настроить параметры системы
            </Paragraph>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        theme="dark" 
        width={280}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: 'linear-gradient(180deg, #001529 0%, #002140 100%)',
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)'
        }}
      >
        <div style={{ 
          padding: collapsed ? '16px 8px' : '24px 20px', 
          textAlign: 'center',
          borderBottom: '1px solid #002140'
        }}>
          {!collapsed ? (
            <>
              <Title level={3} style={{ color: 'white', margin: 0, fontSize: 20 }}>
                🚀 Tender AI
              </Title>
              <Text style={{ color: '#8c8c8c', fontSize: 12 }}>Azure Full Stack Platform</Text>
            </>
          ) : (
            <div style={{ fontSize: 24 }}>🚀</div>
          )}
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onSelect={({ key }) => setSelectedKey(key)}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: 14
          }}
        />
      </Sider>
      
      <Layout>
        <Header 
          style={{ 
            background: 'white', 
            padding: '0 32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Title level={4} style={{ margin: 0, color: '#262626' }}>
            AI-Ассистент для анализа тендеров
          </Title>
          
          <Space size="large">
            <Badge count={5} size="small">
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                size="large"
                style={{ color: '#595959' }}
              />
            </Badge>
            <Avatar 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#1890ff' }}
            />
          </Space>
        </Header>
        
        <Content 
          style={{ 
            margin: '32px',
            background: '#f5f5f5',
            borderRadius: 12,
            overflow: 'hidden'
          }}
        >
          <div style={{ background: 'white', minHeight: 'calc(100vh - 180px)', borderRadius: 12 }}>
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App 