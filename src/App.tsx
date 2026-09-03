import { BookOutlined } from '@ant-design/icons';
import { Button, Layout, Space, Typography, theme } from 'antd';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

function App() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          paddingInline: 24,
        }}
      >
        <BookOutlined style={{ fontSize: 22, color: '#fff' }} />
        <Text strong style={{ color: '#fff', fontSize: 18 }}>
          Knowledge Hub
        </Text>
      </Header>

      <Content style={{ padding: '48px 24px' }}>
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: 48,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            textAlign: 'center',
          }}
        >
          <Title level={2} style={{ marginTop: 0 }}>
            项目已就绪
          </Title>
          <Paragraph type="secondary">
            技术栈：React + TypeScript + Ant Design + Axios + Vite
          </Paragraph>
          <Space>
            <Button type="primary" href="https://ant.design" target="_blank">
              Ant Design 文档
            </Button>
            <Button href="https://axios-http.com" target="_blank">
              Axios 文档
            </Button>
          </Space>
        </div>
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        Knowledge Hub Frontend ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}

export default App;
