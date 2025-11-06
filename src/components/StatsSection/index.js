import React, { useEffect, useState, useRef } from "react";
import { getAdminStatistics } from "../../services/userService";

import {
  CalendarOutlined,
  UserOutlined,
  HomeOutlined,
  TeamOutlined,
  StarFilled,
} from "@ant-design/icons";

export default function StatsSection() {
  const [stats, setStats] = useState(null);
  const [counts, setCounts] = useState([]);
  const sectionRef = useRef(null);

  const fetchAdminStats = async () => {
    try {
      const res = await getAdminStatistics();
      if (res?.errCode === 0) {
        const data = res.data.overview;

        const formattedStats = [
          {
            to: data.totalBookings,
            label: "Lượt đặt lịch",
            icon: <CalendarOutlined />,
          },
          {
            to: data.totalHospitals,
            label: "Bệnh viện",
            icon: <HomeOutlined />,
          },
          {
            to: data.totalDoctors,
            label: "Bác sĩ hợp tác",
            icon: <UserOutlined />,
          },
          {
            to: data.totalPatients,
            label: "Khách hàng",
            icon: <TeamOutlined />,
          },
          { to: 4.9, label: "Mức độ hài lòng", icon: <StarFilled /> },
        ];

        setStats(formattedStats);
        setCounts(formattedStats.map(() => 0));
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    }
  };

  const startCounter = () => {
    stats.forEach((item, i) => {
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
    fetchAdminStats();
  }, []);

  useEffect(() => {
    if (!stats) return;

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && startCounter(),
      { threshold: 0.4 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [stats]);

  if (!stats) return null;

  return (
    <div
      ref={sectionRef}
      className="container text-center pt-5"
      style={{ maxWidth: "60%" }}
    >
      <div className="row g-4 justify-content-center">
        {stats.map((item, i) => (
          <div className="col-6 col-md-2" key={i}>
            <div className="d-flex flex-column align-items-center">
              {/* <div style={{ fontSize: "30px", color: "#f0ad4e" }}>
                {item.icon}
              </div> */}

              <h3
                className="fw-bold text-warning"
                style={{ fontSize: "40px", margin: "10px 0" }}
              >
                {Math.ceil(counts[i])}
                {item.to !== 4.9 ? "+" : ""}
                {item.to === 4.9 && <StarFilled />}
              </h3>

              <span
                style={{
                  fontSize: "16px",
                  color: "#064580",
                  fontWeight: "bold",
                }}
              >
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
