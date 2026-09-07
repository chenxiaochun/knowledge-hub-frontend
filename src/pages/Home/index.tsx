import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function HomePage() {
  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>
        欢迎使用 Knowledge Hub
      </Title>
      <Paragraph type="secondary">
        从左侧菜单进入「文档检索」「文档管理」「用户管理」；管理员还可配置「角色权限」。
      </Paragraph>
    </div>
  );
}
