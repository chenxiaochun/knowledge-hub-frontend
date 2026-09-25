import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** 顶栏导航切换页面时回到顶部；同一路径仅改 query 不触发（如 Chat 切换 session） */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
