import React from "react";

export default function BookCard({ book, onIssue }) {
  return (
    <div
      className="card p-4 rounded-2xl shadow-lg bg-white bg-cover bg-center hover:shadow-xl transition"
      style={{
        backgroundImage: `url("1d926914f0517672b957441ae6107565.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl flex flex-col justify-between h-full">
        <div>
          <h2 className="text-xl font-bold mb-2" style={{ color: `rgb(14 104 219)` }}>
            {book.title}
          </h2>

          <p className="text-gray-700 mb-1">
            <span className="font-semibold">লেখক:</span> {book.author}
          </p>
          <p className="text-gray-700 mb-1">
            <span className="font-semibold">প্রকাশক:</span> {book.published_by}
          </p>
          <p className="text-gray-700 mb-1">
            <span className="font-semibold">শ্রেণি:</span> {book.category}
          </p>
          <p className="text-gray-700 mb-1">
            <span className="font-semibold">ভাষা:</span> {book.language}
          </p>
          <p className="text-gray-700 mb-1">
            <span className="font-semibold">মোট সংখ্যা:</span> {book.quantity}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">স্টকে আছে:</span> {book.available}
          </p>
        </div>

  

      </div>
    </div>
  );
}
