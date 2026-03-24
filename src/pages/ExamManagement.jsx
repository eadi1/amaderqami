import React from 'react';
import { BiIdCard } from 'react-icons/bi';
import IslamicCard from '../components/islamicCard';
import { BsCalendarCheck } from 'react-icons/bs';
import { AiOutlineFileDone } from 'react-icons/ai';
import { MdCategory } from 'react-icons/md';
import { Link } from 'react-router-dom';

export default function ExamManagement() {
  const cards = [
    { title: "প্রবেশপত্র", icon: <BiIdCard className='card_icon1' />, link: "admitcard" },
    { title: "সিট প্ল্যান", icon: <BsCalendarCheck className='card_icon1' />, link: "sheetplan" },
    { title: "ফলাফল প্রকাশ", icon: <AiOutlineFileDone className='card_icon1' />, link: "resultpublish" },
    { title: "পরীক্ষার ধরন", icon: <MdCategory className='card_icon1' />, link: "examtype" },
  { title: "পরীক্ষার সেট আপ", icon: <MdCategory className='card_icon1' />, link: "exam-setup" },
 
  ];

  if (!cards || cards.length === 0) return <div>No exam management cards found.</div>;

  return (
    <main className='main-container'>
      <div className='main-cards'>
        {cards.map((card, idx) => (
          <Link to={card.link} key={idx} aria-label={card.title}>
         
                     <IslamicCard title={card.title} icon= {card.icon} />
          </Link>
        ))}
      </div>
    </main>
  );
}



