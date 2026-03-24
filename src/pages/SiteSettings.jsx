import React from 'react';
import { BiSolidTimer, BiSolidUser } from 'react-icons/bi';
import { BsHouseDoorFill, BsBookHalf } from 'react-icons/bs';
import { FiMessageSquare, FiSettings } from 'react-icons/fi';
import { TbPackage } from 'react-icons/tb';
import { Link } from 'react-router-dom';
import IslamicCard from '../components/islamicCard';
function SiteSettings() {
  const cards = [
    {title: "বিভাগ", icon: <BiSolidUser className='card_icon1' />, link: "division-management" },
    { title: "শ্রেনী", icon: <BsHouseDoorFill className='card_icon1' />, link: "jamat-management" },
    { title: "সেশন", icon: <BiSolidTimer className='card_icon1' />, link: "session-management" },
    { title: "কিতাব", icon: <BsBookHalf className='card_icon1' />, link: "kitab-management" },
    { title: "ইউজার", icon: <BiSolidUser className='card_icon1' />, link: "user-management" },
    { title: "সাইট সেটিংস", icon: <FiSettings className='card_icon1' />, link: "site-setting" },
    { title: "প্যাকেজ", icon: <TbPackage className='card_icon1' />, link: "package-management" },
    { title: "সীট নাম্বার", icon: <TbPackage className='card_icon1' />, link: "sheetnumber" },
    {title:"এসএমএস সেটিংস", icon:<FiMessageSquare className='card_icon1' />, link:"sms-settings" },
  ];

  return (
    <main className='main-container'>
      <div className='main-cards'>
        {cards.map((card, idx) => (
          <Link to={card.link} key={idx}>
         
                     <IslamicCard title={card.title} icon= {card.icon} />
          </Link>
        ))}
      </div>
    </main>
  );
}

export default SiteSettings;
