import React from 'react';
import { BiSolidUser } from 'react-icons/bi';
import { BsCardText } from 'react-icons/bs';
import { AiOutlineNumber } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import IslamicCard from '../components/islamicCard';
function SiteSettings() {
  // শিক্ষার্থী সম্পর্কিত কার্ডগুলো
  const cards = [
    { title: "সক্রিয় শিক্ষার্থী", icon: <BiSolidUser className='card_icon1' />, link: "/students/active" },
    { title: "নিষ্ক্রিয় শিক্ষার্থী", icon: <BiSolidUser className='card_icon1' />, link: "/students/inactive" },
    { title: "স্থগিত শিক্ষার্থী", icon: <BiSolidUser className='card_icon1' />, link: "/students/suspended" },
    { title: "আইডি কার্ড", icon: <BsCardText className='card_icon1' />, link: "/students/idcard" },
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
