import React, { useState } from 'react';
import { Demo1_ThreeJS } from './Demo1_ThreeJS';
import { Demo2_CSS3D } from './Demo2_CSS3D';
import { Demo3_SVG3D } from './Demo3_SVG3D';
import { Demo4_ThreeJSWithImages } from './Demo4_ThreeJSWithImages';
import { Demo5_CSS3D_SVG3D } from './Demo5_CSS3D_SVG3D';
import { Demo6_Interactive3D } from './Demo6_Interactive3D';

type DemoType = 'threejs' | 'css3d' | 'svg3d' | 'threejs-images' | 'css3d-svg3d' | 'interactive3d';

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
    console.log(`${demoName} clicked: Zone ${zone}, Col ${col}`);
  };

  const demos = [
    { id: 'threejs' as DemoType, name: 'Three.js 3D Grid', component: Demo1_ThreeJS, description: '使用Three.js创建3D网格，提供精确的点击检测' },
    { id: 'css3d' as DemoType, name: 'CSS 3D + 坐标映射', component: Demo2_CSS3D, description: '使用CSS 3D变换 + JavaScript坐标映射实现点击检测' },
    { id: 'svg3d' as DemoType, name: 'SVG 3D', component: Demo3_SVG3D, description: '使用SVG的3D变换功能，支持原生点击事件' },
    { id: 'threejs-images' as DemoType, name: 'Three.js with Images', component: Demo4_ThreeJSWithImages, description: 'Three.js 3D网格 + 球员图片放置功能' },
    { id: 'css3d-svg3d' as DemoType, name: 'CSS 3D + SVG 3D', component: Demo5_CSS3D_SVG3D, description: '结合CSS 3D的视角控制和SVG 3D的精确点击检测' },
    { id: 'interactive3d' as DemoType, name: '交互式3D场景', component: Demo6_Interactive3D, description: 'CSS 3D + SVG 3D实现立体效果和丰富交互（滚动、缩放、点击、拖拽）' },
  ];

  const CurrentDemo = demos.find(d => d.id === currentDemo)?.component;

  return (
    <div style={{ width: '100%', height: '100vh', background: '#0f0f0f', overflow: 'hidden' }}>
      {/* 顶部导航 */}
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

      {/* 当前Demo */}
      <div style={{ marginTop: '60px' }}>
        {CurrentDemo && (
          <CurrentDemo onCellClick={(zone, col) => handleCellClick(demos.find(d => d.id === currentDemo)!.name, zone, col)} />
        )}
      </div>

      {/* 点击日志 */}
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
          点击日志 (最近10次)
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
              暂无点击记录
            </div>
          )}
        </div>
      </div>

      {/* Demo说明 */}
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
            特点
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#9ca3af', fontSize: '12px' }}>
            {currentDemo === 'threejs' && (
              <>
                <li>成熟的3D引擎，功能丰富</li>
                <li>精确的射线投射点击检测</li>
                <li>优秀的性能和社区支持</li>
              </>
            )}
            {currentDemo === 'css3d' && (
              <>
                <li>不需要额外的3D库</li>
                <li>通过JavaScript精确控制坐标</li>
                <li>保持CSS 3D的视觉效果</li>
              </>
            )}
            {currentDemo === 'svg3d' && (
              <>
                <li>原生支持3D变换</li>
                <li>矢量图形，缩放不失真</li>
                <li>简单的事件处理</li>
              </>
            )}
            {currentDemo === 'threejs-images' && (
              <>
                <li>完整的3D游戏体验</li>
                <li>支持球员图片放置</li>
                <li>精确的点击检测和交互</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};