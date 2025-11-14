import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Table, Spin, message } from "antd";
import {
  CalendarOutlined,
  UserAddOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  StarOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

import { getHospitalStatistics } from "../../../../services/userService";
import { useSelector } from "react-redux";
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
import { Buffer } from "buffer";
import DoctorImg from "../../../../assets/specialty/doctor.jpg";
import "./LeaderHospitalDashboard.scss";
import { formatDate } from "../../../../utils";
import { LANGUAGES } from "../../../../utils";

import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const LeaderHospitalDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [specialtyData, setSpecialtyData] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const userInfo = useSelector((state) => state.user.userInfo);
  const language = useSelector((state) => state.app.language);

  useEffect(() => {
    fetchHospitalStats();
  }, []);

  const fetchHospitalStats = async () => {
    try {
      setLoading(true);
      const hospitalId = userInfo?.hospitalId;
      const res = await getHospitalStatistics(hospitalId);

      if (res?.data) {
        const data = res.data;

        setStats({
          totalAppointments: data.bookingsByStatus?.reduce(
            (sum, s) => sum + Number(s.count),
            0
          ),
          ConfirmedAppointments:
            data.bookingsByStatus?.find((s) => s.statusId === "S2")?.count || 0,
          DoneAppointments:
            data.bookingsByStatus?.find((s) => s.statusId === "S4")?.count || 0,
          CanceledAppointments:
            data.bookingsByStatus?.find((s) => s.statusId === "S5")?.count || 0,
          totalPatients: data.totalPatients || 0,
          totalDoctors: data.totalDoctors || 0,
          totalSpecialties: data.totalSpecialties || 0,
          todayAppointments: data.todayAppointments || 0,
        });

        // Biểu đồ cột: lịch hẹn theo ngày
        setAppointmentsData(
          data.bookingsByDate?.map((item) => ({
            date: formatDate(item.date),
            value: Number(item.count),
          })) || []
        );

        // Biểu đồ tròn: top chuyên khoa
        setSpecialtyData(
          data.topSpecialties?.map((item) => ({
            type:
              item.doctorInfoData?.specialty?.name ||
              (language === LANGUAGES.VI ? "Không rõ" : "Unknown"),
            value: item.totalBookings || 0,
          })) || []
        );

        // Bảng: top bác sĩ
        setTopDoctors(
          data.topDoctors?.map((doc, i) => ({
            key: i + 1,
            doctorName: doc.infoDataDoctor?.fullName || "---",
            doctorAvatar: doc.infoDataDoctor?.avatar,
            totalBookings: doc.totalBookings,
          })) || []
        );
      }
    } catch (error) {
      console.error(error);
      message.error(
        language === LANGUAGES.VI
          ? "Không thể tải thống kê bệnh viện!"
          : "Failed to load hospital statistics!"
      );
    } finally {
      setLoading(false);
    }
  };

  const barData = {
    labels: appointmentsData.map((item) => item.date),
    datasets: [
      {
        label: language === LANGUAGES.VI ? "Số lịch hẹn" : "Appointments",
        data: appointmentsData.map((item) => item.value),
        backgroundColor: "rgba(24, 144, 255, 0.7)",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
  };

  const pieData = {
    labels: specialtyData.map((item) => item.type),
    datasets: [
      {
        label: language === LANGUAGES.VI ? "Lịch hẹn" : "Bookings",
        data: specialtyData.map((item) => item.value),
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
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const columns = [
    {
      title: language === LANGUAGES.VI ? "STT" : "No.",
      dataIndex: "key",
      key: "key",
      width: 70,
    },
    {
      title: language === LANGUAGES.VI ? "Bác sĩ" : "Doctor",
      dataIndex: "doctorName",
      key: "doctorName",
    },
    {
      title: language === LANGUAGES.VI ? "Tổng lịch hẹn" : "Total Bookings",
      dataIndex: "totalBookings",
      key: "totalBookings",
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin
          size="large"
          tip={
            language === LANGUAGES.VI
              ? "Đang tải thống kê..."
              : "Loading statistics..."
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
              language === LANGUAGES.VI
                ? "Tổng lịch hẹn"
                : "Total Appointments",
            value: stats?.totalAppointments,
            icon: (
              <CalendarOutlined style={{ fontSize: 28, color: "#1677ff" }} />
            ),
            bgColor:
              "linear-gradient(316.02deg, #4e8cff 5.24%, #1f49cd 87.62%)",
            color: "white",
          },
          {
            title: language === LANGUAGES.VI ? "Đã xác nhận" : "Confirmed",
            value: stats?.ConfirmedAppointments,
            icon: (
              <CheckCircleOutlined style={{ fontSize: 28, color: "#52c41a" }} />
            ),
            bgColor:
              "linear-gradient(351.87deg, rgb(247 241 241) 0.55%, rgb(193 229 255) 43.79%, rgb(255, 255, 255) 97.25%)",
            border: "1px solid #7eb2e9",
          },
          {
            title: language === LANGUAGES.VI ? "Đã hoàn thành" : "Completed",
            value: stats?.DoneAppointments,
            icon: (
              <CheckCircleOutlined style={{ fontSize: 28, color: "#13c2c2" }} />
            ),
            bgColor: "linear-gradient(180deg, #15b02c, #6ce27e)",
            color: "white",
          },
          {
            title: language === LANGUAGES.VI ? "Đã hủy" : "Canceled",
            value: stats?.CanceledAppointments,
            icon: (
              <CloseCircleOutlined style={{ fontSize: 28, color: "#ff4d4f" }} />
            ),
            bgColor:
              "linear-gradient(145.87deg, #fff .55%, #ffebeb 43.79%, #fff 97.25%)",
            border: "1px solid #fca5a5",
          },
          {
            title:
              language === LANGUAGES.VI
                ? "Tổng lịch hẹn hôm nay"
                : "Today's Appointments",
            value: stats?.todayAppointments,
            icon: (
              <CalendarOutlined style={{ fontSize: 28, color: "#faad14" }} />
            ),
            border: "1px solid #fca5a5",
          },
          {
            title:
              language === LANGUAGES.VI ? "Tổng bệnh nhân" : "Total Patients",
            value: stats?.totalPatients,
            icon: (
              <UserAddOutlined style={{ fontSize: 28, color: "#722ed1" }} />
            ),
            border: "1px solid #7eb2e9",
          },
          {
            title: language === LANGUAGES.VI ? "Tổng bác sĩ" : "Total Doctors",
            value: stats?.totalDoctors,
            icon: <TeamOutlined style={{ fontSize: 28, color: "#1677ff" }} />,
            border: "1px solid #7eb2e9",
          },
          {
            title:
              language === LANGUAGES.VI
                ? "Tổng chuyên khoa"
                : "Total Specialties",
            value: stats?.totalSpecialties,
            icon: <StarOutlined style={{ fontSize: 28, color: "#eb2f96" }} />,
            border: "1px solid #fca5a5",
          },
        ].map((item, i) => (
          <Col span={6} key={i}>
            <Card
              hoverable
              style={{
                borderRadius: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                backgroundImage: `${item?.bgColor}`,
                color: `${item?.color}`,
                border: `${item?.border}`,
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
                <div className="p-2 bg-white rounded-3">{item.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>
                  {item.value}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Content */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        {/* Left: Top doctor & table */}
        <Col span={12}>
          <Card
            title={
              <span style={{ fontWeight: 600, fontSize: 18 }}>
                {language === LANGUAGES.VI
                  ? "Top bác sĩ có nhiều lịch hẹn nhất"
                  : "Top Doctors with Most Appointments"}
              </span>
            }
            style={{
              height: "100%",
              marginBottom: 16,
              border: "1px solid #74d8fd",
              borderRadius: 10,
            }}
          >
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

            <div style={{ height: "calc(100% - 120px)" }}>
              <Table
                columns={columns}
                dataSource={topDoctors}
                pagination={false}
              />
            </div>
          </Card>
        </Col>

        {/* Right: Charts */}
        <Col span={12}>
          <Card
            title={
              language === LANGUAGES.VI
                ? "Thống kê lịch hẹn theo ngày"
                : "Appointments by Date"
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
              />
            </div>
          </Card>

          <Card
            title={
              language === LANGUAGES.VI
                ? "Top chuyên khoa có nhiều lịch hẹn"
                : "Top Specialties by Bookings"
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
    </div>
  );
};

export default LeaderHospitalDashboard;
