import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Table, Spin, message, Avatar } from "antd";
import {
  CalendarOutlined,
  UserAddOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  StarOutlined,
  TeamOutlined,
  ShopOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

import { getAdminStatistics } from "../../../../services/userService";
import { useSelector } from "react-redux";
import { LANGUAGES } from "../../../../utils";
import { formatDate } from "../../../../utils";
import { Buffer } from "buffer";
import DoctorImg from "../../../../assets/specialty/doctor.jpg";

import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [last7DaysData, setLast7DaysData] = useState([]);
  const [topHospitals, setTopHospitals] = useState([]);
  const [topSpecialties, setTopSpecialties] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);

  const language = useSelector((state) => state.app.language);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await getAdminStatistics();

      if (res?.errCode === 0) {
        const data = res.data;

        // Tổng hợp stats cho KPIs
        const totalConfirmed =
          data.bookingsByStatus?.find((s) => s.statusId === "S2")?.count || 0;
        const totalDone =
          data.bookingsByStatus?.find((s) => s.statusId === "S4")?.count || 0;
        const totalCanceled =
          data.bookingsByStatus?.find((s) => s.statusId === "S5")?.count || 0;

        setStats({
          totalHospitals: data.overview.totalHospitals,
          totalDoctors: data.overview.totalDoctors,
          totalPatients: data.overview.totalPatients,
          totalAppointments: data.overview.totalBookings,
          todayAppointments: data.overview.todayBookings,
          confirmedAppointments: totalConfirmed,
          completedAppointments: totalDone,
          canceledAppointments: totalCanceled,
        });

        // Biểu đồ cột: 7 ngày gần nhất
        const sortedDays = data.last7DaysBookings.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setLast7DaysData(
          sortedDays.map((item) => ({
            date: formatDate(item.date),
            value: item.count,
          }))
        );

        // Top bệnh viện
        setTopHospitals(
          data.topHospitals.map((h, i) => ({
            key: i + 1,
            hospitalName: h.hospitalName,
            hospitalImg: h.hospitalImg,
            totalBookings: h.totalBookings,
          }))
        );

        // Top chuyên khoa
        setTopSpecialties(
          data.topSpecialties.map((s) => ({
            type: s.specialtyName,
            value: s.totalBookings,
          }))
        );

        // Top bác sĩ
        setTopDoctors(
          data.topDoctors.map((doc, i) => ({
            key: i + 1,
            doctorName: doc.doctorName,
            doctorAvatar: doc.avatar,
            totalBookings: doc.totalBookings,
          }))
        );
      } else {
        throw new Error(res?.errMessage || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      message.error(
        language === LANGUAGES.VI
          ? "Không thể tải thống kê hệ thống!"
          : "Failed to load system statistics!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Biểu đồ cột: 7 ngày
  const barData = {
    labels: last7DaysData.map((d) => d.date),
    datasets: [
      {
        label: language === LANGUAGES.VI ? "Số lịch hẹn" : "Appointments",
        data: last7DaysData.map((d) => d.value),
        backgroundColor: "rgba(24, 144, 255, 0.7)",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
  };

  // Biểu đồ tròn: Top chuyên khoa
  const pieData = {
    labels: topSpecialties.map((s) => s.type),
    datasets: [
      {
        label: language === LANGUAGES.VI ? "Lịch hẹn" : "Bookings",
        data: topSpecialties.map((s) => s.value),
        backgroundColor: [
          "#1890ff",
          "#52c41a",
          "#faad14",
          "#f5222d",
          "#722ed1",
          "#eb2f96",
        ],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: { legend: { position: "bottom" } },
  };

  // Bảng: Top bệnh viện
  const hospitalColumns = [
    {
      title: language === LANGUAGES.VI ? "STT" : "No.",
      dataIndex: "key",
      width: 60,
    },
    {
      title: language === LANGUAGES.VI ? "Bệnh viện" : "Hospital",
      dataIndex: "hospitalName",
    },
    {
      title: language === LANGUAGES.VI ? "Tổng lịch hẹn" : "Total Bookings",
      dataIndex: "totalBookings",
    },
  ];

  // Bảng: Top bác sĩ
  const doctorColumns = [
    {
      title: language === LANGUAGES.VI ? "STT" : "No.",
      dataIndex: "key",
      width: 60,
    },
    {
      title: language === LANGUAGES.VI ? "Bác sĩ" : "Doctor",
      dataIndex: "doctorName",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar
            src={
              record.doctorAvatar
                ? Buffer.from(record.doctorAvatar, "base64").toString("binary")
                : DoctorImg
            }
            size={32}
          />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: language === LANGUAGES.VI ? "Tổng lịch hẹn" : "Total Bookings",
      dataIndex: "totalBookings",
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin
          size="large"
          tip={
            language === LANGUAGES.VI
              ? "Đang tải thống kê hệ thống..."
              : "Loading system statistics..."
          }
        />
      </div>
    );
  }

  return (
    <div className="vh-100 overflow-auto p-4 no-scrollbar">
      {/* KPIs */}
      <Row gutter={[16, 16]}>
        {[
          {
            title:
              language === LANGUAGES.VI ? "Tổng bệnh viện" : "Total Hospitals",
            value: stats.totalHospitals,
            icon: <ShopOutlined style={{ fontSize: 28, color: "#1677ff" }} />,
          },
          {
            title: language === LANGUAGES.VI ? "Tổng bác sĩ" : "Total Doctors",
            value: stats.totalDoctors,
            icon: <TeamOutlined style={{ fontSize: 28, color: "#52c41a" }} />,
          },
          {
            title:
              language === LANGUAGES.VI ? "Tổng bệnh nhân" : "Total Patients",
            value: stats.totalPatients,
            icon: (
              <UserAddOutlined style={{ fontSize: 28, color: "#722ed1" }} />
            ),
          },
          {
            title:
              language === LANGUAGES.VI
                ? "Tổng lịch hẹn"
                : "Total Appointments",
            value: stats.totalAppointments,
            icon: (
              <CalendarOutlined style={{ fontSize: 28, color: "#faad14" }} />
            ),
          },
          {
            title:
              language === LANGUAGES.VI
                ? "Lịch hẹn hôm nay"
                : "Today's Appointments",
            value: stats.todayAppointments,
            icon: (
              <CheckCircleOutlined style={{ fontSize: 28, color: "#13c2c2" }} />
            ),
          },
          {
            title: language === LANGUAGES.VI ? "Đã xác nhận" : "Confirmed",
            value: stats.confirmedAppointments,
            icon: (
              <CheckCircleOutlined style={{ fontSize: 28, color: "#389e0d" }} />
            ),
          },
          {
            title: language === LANGUAGES.VI ? "Đã hoàn thành" : "Completed",
            value: stats.completedAppointments,
            icon: (
              <CheckCircleOutlined style={{ fontSize: 28, color: "#08979c" }} />
            ),
          },
          {
            title: language === LANGUAGES.VI ? "Đã hủy" : "Canceled",
            value: stats.canceledAppointments,
            icon: (
              <CloseCircleOutlined style={{ fontSize: 28, color: "#ff4d4f" }} />
            ),
          },
        ].map((item, i) => (
          <Col span={6} key={i}>
            <Card
              hoverable
              style={{
                borderRadius: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
              bodyStyle={{ padding: 18 }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                {item.title}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  justifyContent: "space-between",
                }}
              >
                <div>{item.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>
                  {item.value}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts & Tables */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        {/* Left: Top Hospitals + Top Doctors */}
        <Col span={12}>
          {/* Top 1 Hospital */}
          {topHospitals.length > 0 && (
            <div
              style={{
                marginBottom: 16,
                padding: "16px",
                borderRadius: 12,
                background: "#e6f7ff",
                border: "1px solid #91d5ff",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              {topHospitals[0]?.hospitalImg ? (
                <img
                  src={Buffer.from(
                    topHospitals[0].hospitalImg,
                    "base64"
                  ).toString("binary")}
                  alt="hospital"
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #1890ff",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    backgroundColor: "#1890ff",
                    color: "#fff",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "bold",
                    fontSize: 24,
                  }}
                >
                  {topHospitals[0]?.hospitalName?.charAt(0)}
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {topHospitals[0].hospitalName}
                </div>
                <div
                  style={{ fontSize: 15, color: "#0066cc", fontWeight: 600 }}
                >
                  {topHospitals[0].totalBookings}{" "}
                  {language === LANGUAGES.VI ? "lịch hẹn" : "appointments"}
                </div>
              </div>

              <TrophyOutlined
                style={{ fontSize: 32, color: "#1890ff", marginRight: 10 }}
              />
            </div>
          )}
          {/* Top Doctor */}
          {topDoctors.length > 0 && (
            <div
              style={{
                marginBottom: 16,
                padding: "16px",
                borderRadius: 12,
                background: "#fff7e6",
                border: "1px solid #ffd591",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <img
                src={
                  topDoctors[0]?.doctorAvatar
                    ? Buffer.from(
                        topDoctors[0]?.doctorAvatar,
                        "base64"
                      ).toString("binary")
                    : DoctorImg
                }
                alt="doctor"
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #faad14",
                }}
              />

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {topDoctors[0].doctorName}
                </div>
                <div
                  style={{ fontSize: 15, color: "#d46b08", fontWeight: 600 }}
                >
                  {topDoctors[0].totalBookings}{" "}
                  {language === LANGUAGES.VI ? "lịch hẹn" : "appointments"}
                </div>
              </div>

              <TrophyOutlined
                style={{ fontSize: 32, color: "#fa8c16", marginRight: 10 }}
              />
            </div>
          )}
          {/* Top Hospitals */}
          <Card
            title={
              <span style={{ fontWeight: 600, fontSize: 18 }}>
                {language === LANGUAGES.VI
                  ? "Top bệnh viện hoạt động tốt nhất"
                  : "Top Performing Hospitals"}
              </span>
            }
            style={{
              height: 399,
              border: "1px solid #74d8fd",
              borderRadius: 10,
            }}
          >
            <Table
              columns={hospitalColumns}
              dataSource={topHospitals}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Right: Charts */}
        <Col span={12}>
          <Card
            title={
              language === LANGUAGES.VI
                ? "Lịch hẹn 7 ngày gần nhất"
                : "Last 7 Days Appointments"
            }
            style={{
              height: 300,
              marginBottom: 16,
              border: "1px solid #74d8fd",
              borderRadius: 10,
            }}
          >
            <div style={{ width: "100%", height: "100%" }}>
              <Bar
                data={barData}
                options={{ ...barOptions, maintainAspectRatio: false }}
                style={{ height: "220px" }}
              />
            </div>
          </Card>

          <Card
            title={
              language === LANGUAGES.VI
                ? "Top chuyên khoa toàn hệ thống"
                : "Top Specialties System-wide"
            }
            style={{
              height: 300,
              border: "1px solid #74d8fd",
              borderRadius: 10,
            }}
          >
            <div style={{ width: "100%", height: "100%" }}>
              <Pie
                data={pieData}
                options={{ ...pieOptions, maintainAspectRatio: false }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Bottom: Top Doctors Table */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title={
              <span style={{ fontWeight: 600, fontSize: 18 }}>
                {language === LANGUAGES.VI
                  ? "Top bác sĩ toàn hệ thống"
                  : "Top Doctors System-wide"}
              </span>
            }
            style={{
              border: "1px solid #74d8fd",
              borderRadius: 10,
            }}
          >
            <Table
              columns={doctorColumns}
              dataSource={topDoctors}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
