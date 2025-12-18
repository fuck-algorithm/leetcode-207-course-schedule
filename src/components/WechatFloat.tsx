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
        <svg className="wechat-svg" viewBox="0 0 24 24" fill="white">
          <path d="M9.5 4C5.36 4 2 6.69 2 10c0 1.89 1.08 3.56 2.78 4.66L4 17l2.5-1.5c.89.32 1.89.5 3 .5.17 0 .34 0 .5-.02-.16-.49-.25-1-.25-1.48 0-3.31 3.36-6 7.5-6 .17 0 .33 0 .5.02C17.07 5.69 13.64 4 9.5 4zM7 9a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm5 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm5.5 2c-3.58 0-6.5 2.24-6.5 5s2.92 5 6.5 5c.87 0 1.7-.14 2.45-.4L22 22l-.78-2.33C22.31 18.56 23 17.33 23 16c0-2.76-2.92-5-6.5-5zm-2 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
        </svg>
        <span className="wechat-icon-text">交流群</span>
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
