import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function HomePage() {
  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>
        欢迎使用 Knowledge Hub
      </Title>
      <Paragraph type="secondary">
        从左侧菜单进入「文档管理」上传与发布文档，或在「用户管理」维护系统用户。
      </Paragraph>
    </div>
  );
}
