// src/components/InterestCards.tsx
import React, { useRef } from "react";

const courses = [
  "Data Analytics",
  "Data Science",
  "AIML",
  "Frontend",
  // add more if needed
];

const InterestCards: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  
  };

  return (
    <div className="interest-section my-16 px-8">
      <h2 className="text-4xl font-bold mb-6 text-center">What brings you here today😉</h2>
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow z-10 hover:bg-yellow-400"
        >
          &#8592;
        </button>

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto space-x-6 scroll-smooth scrollbar-hide py-4"
        >
          {courses.map((course, index) => (
            <div
              key={index}
              className="min-w-[200px] min-h-[200px] flex-shrink-0 bg-white rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300 flex flex-col items-center justify-center"
            >
              <img
                src={`/src/assets/${course}.png`} // automatically uses course name
                alt={course}
                className="w-[2in] h-[2in] object-cover rounded-xl"
              />
              <h3 className="text-xl font-semibold text-center mt-2">{course}</h3>
            </div>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow z-10 hover:bg-yellow-400"
        >
          &#8594;
        </button>
      </div>
    </div>
  );
};

export default InterestCards;

