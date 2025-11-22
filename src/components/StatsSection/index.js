import React, { useEffect, useState, useRef } from "react";
import { getAdminStatistics } from "../../services/userService";
import { useSelector } from "react-redux";

import {
  CalendarOutlined,
  UserOutlined,
  HomeOutlined,
  TeamOutlined,
  StarFilled,
  MedicineBoxOutlined,
} from "@ant-design/icons";

export default function StatsSection() {
  const [stats, setStats] = useState(null);
  const [counts, setCounts] = useState([]);
  const sectionRef = useRef(null);
  const language = useSelector((state) => state.app.language);

  const fetchAdminStats = async () => {
    try {
      const res = await getAdminStatistics();
      if (res?.errCode === 0) {
        const data = res.data.overview;

        const formattedStats = [
          {
            to: data.totalBookings,
            label: language === "vi" ? "Lượt đặt lịch" : "Appointments",
            icon: <CalendarOutlined />,
          },
          {
            to: data.totalHospitals,
            label: language === "vi" ? "Bệnh viện" : "Hospitals",
            icon: <HomeOutlined />,
          },
          {
            to: data.totalDoctors,
            label: language === "vi" ? "Bác sĩ hợp tác" : "Doctors",
            icon: <UserOutlined />,
          },
          {
            to: data.totalPatients,
            label: language === "vi" ? "Khách hàng" : "Patients",
            icon: <TeamOutlined />,
          },
          {
            to: 4.8,
            label: language === "vi" ? "Mức độ hài lòng" : "Rating",
            icon: <StarFilled />,
          },
        ];

        setStats(formattedStats);
        setCounts(formattedStats.map(() => 0));
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    }
  };

  const startCounter = () => {
    const duration = 2000; // tổng thời gian chạy
    const fps = 30; // tốc độ cập nhật
    const steps = duration / (1000 / fps);
    let currentStep = 0;

    const animate = () => {
      currentStep++;
      setCounts((prev) =>
        stats.map((item) => {
          const end = item.to;
          const progress = Math.min(currentStep / steps, 1);
          const value = end * progress;
          // Làm tròn nếu là số thập phân
          return end % 1 !== 0
            ? Math.round(value * 10) / 10
            : Math.round(value);
        })
      );

      if (currentStep < steps) {
        setTimeout(animate, 1000 / fps);
      }
    };

    animate();
  };

  useEffect(() => {
    fetchAdminStats();
  }, [language]);

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

  const formatNumber = (num) =>
    num >= 1000 ? num.toLocaleString("en-US") : num;

  return (
    <div
      ref={sectionRef}
      className="container-fluid container-lg px-4 pt-5 text-center"
    >
      <div className="row g-4 justify-content-center">
        {stats.map((item, i) => (
          <div className="col-6 col-md-2" key={i}>
            <div className="d-flex flex-column align-items-center">
              <h3
                className="fw-bold text-warning"
                style={{ fontSize: "36px", margin: "10px 0" }}
              >
                {item.to % 1 !== 0
                  ? (counts[i] ?? 0).toFixed(1)
                  : formatNumber(Math.floor(counts[i] ?? 0))}

                {item.to !== 4.8 ? "+" : ""}
                {item.to === 4.8 && <StarFilled />}
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
