import React from 'react';
import { BiSolidTimer, BiSolidUser } from 'react-icons/bi';
import {BsHouseDoorFill, BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsFillBellFill, BsBookmark, BsBookHalf } from 'react-icons/bs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';


function SiteSettings() {
  return (
    <main className='main-container'>
        <div className='main-cards'>
            
            <a href='/jamat-management' >
            <div className='card'>
              <br />
             <div className='card-inner'>
                <h1>Jamat </h1>
                <BsHouseDoorFill className='card_icon1' />
              </div>
              <br />
            </div></a>
            
             <div className='card'>
              <div className='card-inner'>
                <h1>Session </h1>
                <BiSolidTimer className='card_icon1' />
              </div>
              
            </div>    <div className='card'>

              <div className='card-inner'>
                <h1>Books</h1>
                <BsBookHalf className='card_icon1' />
              </div>
              
            </div>    <div className='card'>
              <div className='card-inner'>
                <h1>Users</h1>
                <BiSolidUser className='card_icon1' />
              </div>
              
            </div>    <div className='card'>
              <div className='card-inner'>
                <h1>Jamat Setting</h1>
                <BsHouseDoorFill className='card_icon1' />
              </div>
              
            </div>
        
    
            <div className='card'>
              <div className='card-inner'>
                <h3>CUSTOMERS</h3>
                <BsPeopleFill className='card_icon' />
              </div>
              <h1>33</h1>
            </div>
    
            <div className='card'>
              <div className='card-inner'>
                <h3>ALERTS</h3>
                <BsFillBellFill className='card_icon' />
              </div>
              <h1>42</h1>
            </div>
          </div>
    </main>
  );
}

export default SiteSettings;
