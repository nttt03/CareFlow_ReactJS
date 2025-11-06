import React, { useEffect, useState, useRef } from "react";

const statsData = [
  { to: 5000, label: "Lượt đặt lịch", icon: "bi-calendar-check" },
  { to: 50, label: "Bác sĩ hợp tác", icon: "bi-person-badge" },
  { to: 20, label: "Chuyên khoa", icon: "bi-hospital" },
  { to: 4.9, label: "Mức độ hài lòng", icon: "bi-star" },
];

export default function StatsSection() {
  const [counts, setCounts] = useState(statsData.map(() => 0));
  const sectionRef = useRef(null);

  const startCounter = () => {
    setCounts(statsData.map(() => 0)); // reset về 0

    statsData.forEach((item, i) => {
      let start = 0;
      const end = item.to;
      const duration = 2000;
      const increment = end / (duration / 30);

      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          start = end;
          clearInterval(counter);
        }
        setCounts((prev) => {
          const newCounts = [...prev];
          newCounts[i] = start;
          return newCounts;
        });
      }, 30);
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startCounter(); // khi vào khung nhìn → chạy
        }
      },
      { threshold: 0.4 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="container text-center"
      style={{ width: "60%" }}
    >
      <div className="row justify-content-center">
        {statsData.map((item, i) => (
          <div className="col-6 col-md-3" key={i}>
            <h3
              className="fw-bold text-warning mb-2"
              style={{ fontSize: "40px" }}
            >
              {Math.ceil(counts[i])}
              {item.to >= 10 ? "+" : ""}
              {item.to < 10 && "⭐"}
            </h3>
            <i
              className={`${item.icon} text-secondary mb-1`}
              style={{ fontSize: "22px" }}
            />
            <span style={{ fontSize: "20px", color: "#898b8c" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
