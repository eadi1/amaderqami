import React from "react";
import IslamicCard from "../components/islamicCard";
import {
  FaHandHoldingHeart,
  FaUserGraduate,
  FaMoneyBillWave,
  FaHandHoldingUsd,
  FaFileInvoiceDollar,
  FaReceipt,
  FaClipboardList,
    FaStore,          // দকানের নাম
  FaListAlt,        // খরচের ক্যাটাগরি
  FaMoneyCheckAlt,
} from "react-icons/fa";

import { Link } from "react-router-dom";
  const feesCard = [
    {title: "ফান্ড ", icon: <FaFileInvoiceDollar />, link: "fundmanagement" },
    {title: "ফী ধরন", icon: <FaFileInvoiceDollar />, link: "fee-types" },
    { title: "বকেয়া ফী", icon: <FaHandHoldingUsd />, link: "student-dues" },
    { title: "রশিদ বই", icon: <FaReceipt />, link: "roshid" },
    { title: "ফী গ্রহন", icon: <FaMoneyBillWave />, link: "collectfee" },
    { title: "গৃহীত ফী এর তালিকা", icon: <FaClipboardList />, link: "paymentlist" },
  ];

  const donationCards = [
  { title: "দাতা তালিকা", icon: <FaHandHoldingHeart />, link: "donar_list" },
     { title: "রশিদ বই", icon: <FaReceipt />, link: "roshid-other" },
  { title: "দানের ধরণ", icon: <FaHandHoldingHeart />, link: "donation_type" },
  { title: "দান গ্রহন", icon: <FaHandHoldingHeart />, link: "donation_collection" },
];

const expenseCards = [
  { title: "দকানের নাম", icon: <FaStore />, link: "shop" },
  { title: "খরচের ক্যাটাগরি", icon: <FaListAlt />, link: "cost_type" },

  
  { title: "খরচের দাখিল", icon: <FaMoneyCheckAlt />, link: "expense_entry" },
];
function AccountManagement() {


  return (
    <main className="main-container">
      <div className="account-page">
        {/* Summary Cards */}

        <h3>ফী ব্যবস্থাপনা </h3>
        <div className='main-cards'>
        {feesCard.map((card, idx) => (
          <Link to={card.link} key={idx}>

            <IslamicCard title={card.title} icon= {card.icon} />
            
          </Link>
        ))}
      </div>

        
        <br />
      <hr
  style={{
    border: "none",
    height: "3px",
    background: "linear-gradient(to right, green, yellow)",
    borderRadius: "5px",
  }}
/>


        <h3>দান ম্যানেজমেন্ট </h3>
         <div className='main-cards'>
        {donationCards.map((card, idx) => (
          <Link to={card.link} key={idx}>


           
            <IslamicCard title={card.title} icon= {card.icon} />
          </Link>
        ))}
      </div>


 <br />
      <hr
  style={{
    border: "none",
    height: "3px",
    background: "linear-gradient(to right, green, yellow)",
    borderRadius: "5px",
  }}
/>



<h3>খরচ ম্যানেজমেন্ট </h3>
           <div className='main-cards'>
        {expenseCards.map((card, idx) => (
          <Link to={card.link} key={idx}>
           
            <IslamicCard title={card.title} icon= {card.icon} />
          </Link>
        ))}
      </div>



      </div>
    </main>
  );
}

export default AccountManagement;
