import { useState } from 'react';
import './WechatFloat.css';

export default function WechatFloat() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="wechat-float"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="wechat-icon">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
          <path d="M8.5 11.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-6.5 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM9 3C4.58 3 1 6.13 1 10c0 2.17 1.16 4.1 3 5.38V19l3.5-2.1c.5.07 1 .1 1.5.1 4.42 0 8-3.13 8-7s-3.58-7-8-7zm6.5 16.5l2.5 1.5v-2.62c1.84-1.28 3-3.21 3-5.38 0-2.17-1.16-4.1-3-5.38V5c2.76 1.5 4.5 4.5 4.5 8 0 5-4.03 9-9 9-.5 0-1-.03-1.5-.1l3-1.9z"/>
        </svg>
      </div>
      {isHovered && (
        <div className="wechat-popup">
          <img src="./wechat-qr.png" alt="微信二维码" />
          <p>扫码发送 <strong>leetcode</strong> 加入算法交流群</p>
        </div>
      )}
    </div>
  );
}
