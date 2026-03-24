import React from 'react';
import { BiBook } from "react-icons/bi";
import { FaIdCard } from "react-icons/fa";
import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { GiPayMoney } from "react-icons/gi";
import { BsGraphUpArrow, BsGraphDownArrow } from "react-icons/bs";
import { Link } from 'react-router-dom';
import IslamicCard from '../components/islamicCard';

function Protibedon() {

  const cards = [
    { title:"বাড়ির কাজ" , icon:<BiBook className='card_icon1' />, link:"homework-download"},
    { title: "প্রবেশ পত্র", icon: <FaIdCard className='card_icon1' />, link: "jamat-management" },
    { title: "হাজিরা খাতা", icon: <MdOutlineAccessTimeFilled className='card_icon1' />, link: "hajira" },
    { title: "মাসিক আয়", icon: <RiMoneyDollarCircleFill className='card_icon1' />, link: "kitab-management" },
    { title: "মাসিক বায়", icon: <GiPayMoney className='card_icon1' />, link: "user-management" },
    { title: "বাৎসরিক আয়", icon: <BsGraphUpArrow className='card_icon1' />, link: "site-setting" },
    { title: "বাৎসরিক বায়", icon: <BsGraphDownArrow className='card_icon1' />, link: "package-management" },
  ];

  return (
    <main className='main-container'>
      <div className='main-cards'>
        {cards.map((card, idx) => (
          <Link to={card.link} key={idx} className="card-link">
           
                       <IslamicCard title={card.title} icon= {card.icon} />
          </Link>
        ))}
      </div>
    </main>
  );
}

export default Protibedon;
