import React from "react";
import { BrowserRouter as Router, Route, Link, Routes, Navigate, useNavigate } from 'react-router-dom'
import banner from '../image/banner.png';
import brick from '../image/brick.png';
import cement from '../image/cement.png';
import profile from '../image/profile.png';
import armature from '../image/armature.png';
import sand from '../image/sand.png';
import corner from '../image/corner.png';
import block from '../image/block.png';

class MainPage extends React.Component {
    render() {
        return (
                <div className="body-page">
                    <div className="banner">
                        <img src={banner} alt="Баннер" />
                    </div>
                    <div className="products">
                        <div className="item">
                            <img src={brick} alt="" />
                        </div>
                        <div className="item">
                            <img src={cement} alt="" />
                        </div>
                        <div className="item">
                            <img src={profile} alt="" />
                        </div>
                        <div className="item">
                            <img src={armature} alt="" />
                        </div>
                    </div>
                    <div className="products">
                        <div className="item">
                            <img src={sand} alt="" />
                        </div>
                        <div className="item">
                            <img src={corner} alt="" />
                        </div>
                        <div className="item">
                            <img src={block} alt="" />
                        </div>
                        <div className="item">
                            
                        </div>
                    </div>
                    <div className="products">
                        <div className="item">
                            
                        </div>
                        <div className="item">
                            
                        </div>
                        <div className="item">
                            
                        </div>
                        <div className="item">
                            
                        </div>
                    </div>
                </div>
        );
    }
}

export default MainPage;
