import React, { useState } from 'react';
import { Demo1_ThreeJS } from './Demo1_ThreeJS';
import { Demo2_CSS3D } from './Demo2_CSS3D';
import { Demo3_SVG3D } from './Demo3_SVG3D';
import { Demo4_ThreeJSWithImages } from './Demo4_ThreeJSWithImages';
import { Demo5_CSS3D_SVG3D } from './Demo5_CSS3D_SVG3D';
import { Demo6_Interactive3D } from './Demo6_Interactive3D';
import { Demo7_ArcLayout } from './Demo7_ArcLayout';

type DemoType = 'threejs' | 'css3d' | 'svg3d' | 'threejs-images' | 'css3d-svg3d' | 'interactive3d' | 'arclayout';

export const DemosPage: React.FC = () => {
  const [currentDemo, setCurrentDemo] = useState<DemoType>('threejs');
  const [clickLog, setClickLog] = useState<Array<{ demo: string; zone: number; col: number; time: string }>>([]);

  const handleCellClick = (demoName: string, zone: number, col: number) => {
    const newLog = {
      demo: demoName,
      zone,
      col,
      time: new Date().toLocaleTimeString()
    };
    
    setClickLog([newLog, ...clickLog].slice(0, 10));
  };

  const demos = [
    { id: 'threejs' as DemoType, name: 'Three.js 3D Grid', component: Demo1_ThreeJS, description: '使用Three.js创建3D网格，提供精确的点击检测' },
    { id: 'css3d' as DemoType, name: 'CSS 3D + 坐标映射', component: Demo2_CSS3D, description: '使用CSS 3D变换 + JavaScript坐标映射实现点击检测' },
    { id: 'svg3d' as DemoType, name: 'SVG 3D', component: Demo3_SVG3D, description: '使用SVG的3D变换功能，支持原生点击事件' },
    { id: 'threejs-images' as DemoType, name: 'Three.js with Images', component: Demo4_ThreeJSWithImages, description: 'Three.js 3D网格 + 球员图片放置功能' },
    { id: 'css3d-svg3d' as DemoType, name: 'CSS 3D + SVG 3D', component: Demo5_CSS3D_SVG3D, description: '结合CSS 3D的视角控制和SVG 3D的精确点击检测' },
    { id: 'interactive3d' as DemoType, name: '交互式3D场景', component: Demo6_Interactive3D, description: 'CSS 3D + SVG 3D实现立体效果和丰富交互（滚动、缩放、点击、拖拽）' },
    { id: 'arclayout' as DemoType, name: '弧形归路矩阵', component: Demo7_ArcLayout, description: '多层弧形排列，形成归路效果，支持交互和参数调节' },
  ];

  const CurrentDemo = demos.find(d => d.id === currentDemo)?.component;

  return (
    <div style={{ width: '100%', height: '100vh', background: '#0f0f0f', overflow: 'hidden' }}>
      {/* 顶部导航栏 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
        borderBottom: '1px solid #333'
      }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '18px' }}>
          3D Demo Showcase
        </h1>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {demos.map(demo => (
            <button
              key={demo.id}
              onClick={() => setCurrentDemo(demo.id)}
              style={{
                padding: '8px 16px',
                background: currentDemo === demo.id ? '#3b82f6' : '#4b5563',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
            >
              {demo.name}
            </button>
          ))}
        </div>
      </div>

      {/* Current Demo */}
      <div style={{ marginTop: '60px' }}>
        {CurrentDemo && (
          <CurrentDemo onCellClick={(zone, col) => handleCellClick(demos.find(d => d.id === currentDemo)!.name, zone, col)} />
        )}
      </div>

      {/* Click Log */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        padding: '15px 20px',
        borderTop: '1px solid #333',
        maxHeight: '200px',
        overflow: 'auto'
      }}>
        <h3 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '14px' }}>
          Click Log (Last 10)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {clickLog.map((log, index) => (
            <div key={index} style={{ 
              color: '#9ca3af', 
              fontSize: '12px',
              padding: '5px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '4px'
            }}>
              <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{log.demo}</span>
              {' - '}
              Zone {log.zone}, Col {log.col}
              {' - '}
              <span style={{ color: '#6b7280' }}>{log.time}</span>
            </div>
          ))}
          
          {clickLog.length === 0 && (
            <div style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
              鏆傛棤鐐瑰嚮璁板綍
            </div>
          )}
        </div>
      </div>

      {/* 点击日志 */}
      <div style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '8px',
        maxWidth: '300px',
        color: 'white',
        fontSize: '13px',
        lineHeight: '1.5'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#60a5fa' }}>
          {demos.find(d => d.id === currentDemo)?.name}
        </h3>
        <p style={{ margin: 0, color: '#9ca3af' }}>
          {demos.find(d => d.id === currentDemo)?.description}
        </p>
        
        <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#f59e0b' }}>
            Features
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#9ca3af', fontSize: '12px' }}>
            {currentDemo === 'threejs' && (
              <>
                <li>Mature 3D engine with rich features</li>
                <li>Precise raycasting for click detection</li>
                <li>Excellent performance and community support</li>
              </>
            )}
            {currentDemo === 'css3d' && (
              <>
                <li>No external 3D library required</li>
                <li>Precise coordinate control via JavaScript</li>
                <li>Maintains CSS 3D perspective effects</li>
              </>
            )}
            {currentDemo === 'svg3d' && (
              <>
                <li>Native support for 3D transforms</li>
                <li>Small size, minimal overhead</li>
                <li>Simple event handling</li>
              </>
            )}
            {currentDemo === 'threejs-images' && (
              <>
                <li>Complete 3D game experience</li>
                <li>Supports player image placement</li>
                <li>Precise click testing and interaction</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
