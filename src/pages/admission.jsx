import React from 'react';
import { BiTime, BiUserCircle } from 'react-icons/bi';
import IslamicCard from '../components/islamicCard';
import { BsHouseDoorFill, BsFileTextFill, BsPeopleFill, BsBellFill, BsCardChecklist, BsBook } from 'react-icons/bs';
import { Link } from 'react-router-dom';
const cards = [
  {
    title: 'নতুন শিক্ষার্থী ভর্তি',
    icon: <BsHouseDoorFill className='card_icon1' />,
    link: 'new-admission',
  },
  {
    title: 'পুরাতন শিক্ষার্থী ভর্তি',
    icon: <BiTime className='card_icon1' />,
    link: 'old-admission',
  },
   {
    title: ' ভর্তির ফর্ম ',
    icon: <BsFileTextFill className='card_icon1' />,
    link: 'admissionform',
  },
  {
    title: 'নতুন শিক্ষার্থীর ভর্তির আবেদন',
    icon: <BsFileTextFill className='card_icon1' />,
    link: '#',
  },
  {
    title: 'পুরাতন শিক্ষার্থীর ভর্তির আবেদন',
    icon: <BsCardChecklist className='card_icon1' />,
    link: '#',
  },
];
function admission() {
  return (
    <main className='main-container'>
      <div className='main-cards'>
        

{cards.map((card, index) => (
          <Link to={card.link} key={index}>
           
                       <IslamicCard title={card.title} icon= {card.icon} />
          </Link>
        ))}
     
    
      


      </div>
    </main>
  );
}

export default admission;
