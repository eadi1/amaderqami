import React from 'react';

import { FaUserCheck, FaListAlt, FaChalkboardTeacher, FaBookOpen } from "react-icons/fa";
import { Link } from 'react-router-dom';
import IslamicCard from '../components/islamicCard';

function TeacherCorner() {

  const cards = [
    { title: "শিক্ষার্থীর হাজিরা", icon: <FaUserCheck className='card_icon1' />, link: "attendance" },
    { title: "হাজিরা রিপোর্ট", icon: <FaListAlt className='card_icon1' />, link: "attendance-report" },
    { title: "বাড়ির কাজ প্রদান", icon: <FaChalkboardTeacher className='card_icon1' />, link: "homework-add" },
    { title: "ছুটি প্রদান", icon: <FaBookOpen className='card_icon1' />, link: "leave" },

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

export default TeacherCorner;
