import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';

type Indicator = {
  left: number;
  top: number;
  width: number;
  height: number;
  visible: boolean;
};

const EMPTY_INDICATOR: Indicator = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  visible: false,
};

type Props = MenuProps;

export default function HeaderNavMenu({ selectedKeys, className, style, ...rest }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<Indicator>(EMPTY_INDICATOR);
  const [motionReady, setMotionReady] = useState(false);

  const updateIndicator = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const selected = wrap.querySelector<HTMLElement>('.ant-menu-item-selected');
    if (!selected) {
      setIndicator((prev) => ({ ...prev, visible: false }));
      return;
    }

    const wrapRect = wrap.getBoundingClientRect();
    const itemRect = selected.getBoundingClientRect();
    setIndicator({
      left: itemRect.left - wrapRect.left,
      top: itemRect.top - wrapRect.top,
      width: itemRect.width,
      height: itemRect.height,
      visible: true,
    });
  }, []);

  useEffect(() => {
    updateIndicator();
    const raf = requestAnimationFrame(updateIndicator);

    const wrap = wrapRef.current;
    if (!wrap) {
      return () => cancelAnimationFrame(raf);
    }

    const ro = new ResizeObserver(updateIndicator);
    ro.observe(wrap);
    window.addEventListener('resize', updateIndicator);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', updateIndicator);
    };
  }, [selectedKeys, rest.items, updateIndicator]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMotionReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={wrapRef} className="header-nav-menu" style={style}>
      <span
        className={`header-nav-menu-indicator${motionReady ? ' is-animated' : ''}`}
        style={{
          transform: `translate(${indicator.left}px, ${indicator.top}px)`,
          width: indicator.width,
          height: indicator.height,
          opacity: indicator.visible ? 1 : 0,
        }}
        aria-hidden
      />
      <Menu
        mode="horizontal"
        selectedKeys={selectedKeys}
        className={className}
        style={{ background: 'transparent', borderBottom: 'none' }}
        {...rest}
      />
    </div>
  );
}
