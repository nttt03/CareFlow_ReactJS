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

        // Tổng hợp số liệu
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
            type: item.doctorInfoData?.specialty?.name || "Không rõ",
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
      message.error("Không thể tải thống kê bệnh viện!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Biểu đồ cột: Lịch hẹn theo ngày
  const barData = {
    labels: appointmentsData.map((item) => item.date),
    datasets: [
      {
        label: "Số lịch hẹn",
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
        label: "Lịch hẹn",
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

  // 🔹 Bảng: Top bác sĩ có nhiều lịch hẹn
  const columns = [
    { title: "STT", dataIndex: "key", key: "key", width: 70 },
    { title: "Bác sĩ", dataIndex: "doctorName", key: "doctorName" },
    {
      title: "Tổng lịch hẹn",
      dataIndex: "totalBookings",
      key: "totalBookings",
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" tip="Đang tải thống kê..." />
      </div>
    );
  }

  return (
    <div className="vh-100 overflow-auto p-4 no-scrollbar">
      {/* KPIs */}
      <Row gutter={[16, 16]}>
        {[
          {
            title: "Tổng lịch hẹn",
            value: stats?.totalAppointments,
            icon: (
              <CalendarOutlined style={{ fontSize: 28, color: "#1677ff" }} />
            ),
          },
          {
            title: "Đã xác nhận",
            value: stats?.ConfirmedAppointments,
            icon: (
              <CheckCircleOutlined style={{ fontSize: 28, color: "#52c41a" }} />
            ),
          },
          {
            title: "Đã hoàn thành",
            value: stats?.DoneAppointments,
            icon: (
              <CheckCircleOutlined style={{ fontSize: 28, color: "#13c2c2" }} />
            ),
          },
          {
            title: "Đã hủy",
            value: stats?.CanceledAppointments,
            icon: (
              <CloseCircleOutlined style={{ fontSize: 28, color: "#ff4d4f" }} />
            ),
          },
          {
            title: "Tổng lịch hẹn hôm nay",
            value: stats?.todayAppointments,
            icon: (
              <CalendarOutlined style={{ fontSize: 28, color: "#faad14" }} />
            ),
          },
          {
            title: "Tổng bệnh nhân",
            value: stats?.totalPatients,
            icon: (
              <UserAddOutlined style={{ fontSize: 28, color: "#722ed1" }} />
            ),
          },
          {
            title: "Tổng bác sĩ",
            value: stats?.totalDoctors,
            icon: <TeamOutlined style={{ fontSize: 28, color: "#1677ff" }} />,
          },
          {
            title: "Tổng chuyên khoa",
            value: stats?.totalSpecialties,
            icon: <StarOutlined style={{ fontSize: 28, color: "#eb2f96" }} />,
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

      {/* Content */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        {/* Left side: Top doctor & table */}
        <Col span={12}>
          <Card
            title={
              <span style={{ fontWeight: 600, fontSize: 18 }}>
                Top bác sĩ có nhiều lịch hẹn nhất
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
                    🏆 {topDoctors[0].doctorName}
                  </div>
                  <div
                    style={{ fontSize: 15, color: "#d46b08", fontWeight: 600 }}
                  >
                    {topDoctors[0].totalBookings} lịch hẹn
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

        {/* Right side: Charts */}
        <Col span={12}>
          <Card
            title="Thống kê lịch hẹn theo ngày"
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
            title="Top chuyên khoa có nhiều lịch hẹn"
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
