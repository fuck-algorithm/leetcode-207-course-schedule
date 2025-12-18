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
      <div className="wechat-icon">💬</div>
      {isHovered && (
        <div className="wechat-popup">
          <img src="./wechat-qr.png" alt="微信二维码" />
          <p>扫码发送 <strong>leetcode</strong> 加入算法交流群</p>
        </div>
      )}
    </div>
  );
}
