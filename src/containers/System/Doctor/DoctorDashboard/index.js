import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Table, Select } from "antd";
import {
  HeartOutlined,
  TeamOutlined,
  UserAddOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FlagOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { getDoctorStatistics } from "../../../../services/userService";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "../../LeaderHospital/LeaderHospitalDashboard/LeaderHospitalDashboard.scss";

const { Option } = Select;

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels
);

const DoctorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterRange, setFilterRange] = useState("7days");
  const userInfo = useSelector((state) => state.user.userInfo);

  const statusMap = {
    S1: "Chờ xác nhận",
    S2: "Đã xác nhận",
    S3: "Đang khám",
    S4: "Hoàn thành",
    S5: "Đã hủy",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDoctorStatistics(userInfo?.id);
        setStats(res?.data || {});
      } catch (err) {
        console.error("Error fetching doctor stats:", err);
      } finally {
        setLoading(false);
      }
    };
    if (userInfo?.id) fetchData();
  }, [userInfo?.id]);

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (!stats) return <p>Không có dữ liệu thống kê.</p>;

  // === KPI ===
  const totalBookings =
    stats.bookingsByStatus?.reduce((sum, item) => sum + item.count, 0) || 0;

  const statusCounts = {
    S1: 0,
    S2: 0,
    S4: 0,
    S5: 0,
  };

  stats.bookingsByStatus?.forEach((item) => {
    if (statusCounts[item.statusId] !== undefined) {
      statusCounts[item.statusId] = item.count;
    }
  });

  // === Lọc dữ liệu biểu đồ theo thời gian ===
  const now = dayjs();
  const filteredBookings =
    stats.bookingsByDate?.filter((item) => {
      const date = dayjs(item.date);
      if (filterRange === "7days") return date.isAfter(now.subtract(7, "day"));
      if (filterRange === "14days")
        return date.isAfter(now.subtract(14, "day"));
      return true;
    }) || [];

  const barData = {
    labels: filteredBookings.map((item) => dayjs(item.date).format("DD/MM")),
    datasets: [
      {
        label: "Số lịch hẹn",
        data: filteredBookings.map((item) => item.count),
        backgroundColor: [
          "#4f46e5",
          "#6366f1",
          "#818cf8",
          "#a5b4fc",
          "#c7d2fe",
        ],
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: "end",
        align: "top",
        clip: false,
        color: "#000",
        font: { weight: "bold", size: 15 },
        formatter: (value) => value,
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(...barData.datasets[0].data) + 1,
      },
    },
  };

  // === Biểu đồ tròn: trạng thái lịch hẹn ===
  const pieDataRaw =
    stats.bookingsByStatus?.map((item) => ({
      type: statusMap[item.statusId] || item.statusId,
      value: item.count,
    })) || [];

  const pieData = {
    labels: pieDataRaw.map((i) => i.type),
    datasets: [
      {
        data: pieDataRaw.map((i) => i.value),
        backgroundColor: [
          "#3b82f6", // xanh dương
          "#22c55e", // xanh lá
          "#f97316", // cam
          "#a855f7", // tím
          "#ef4444", // đỏ
        ],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: { color: "#333" },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const value = ctx.raw;
            const percent = ((value / total) * 100).toFixed(1);
            return `${ctx.label}: ${value} (${percent}%)`;
          },
        },
      },
      datalabels: {
        color: "#fff",
        formatter: (value, ctx) => {
          const total = ctx.chart.data.datasets[0].data.reduce(
            (a, b) => a + b,
            0
          );
          const percent = ((value / total) * 100).toFixed(1);
          return `${percent}%`;
        },
        font: { weight: "bold", size: 13 },
      },
    },
  };

  // === Bảng top triệu chứng ===
  const columns = [
    { title: "Triệu chứng", dataIndex: "symptoms", key: "symptoms" },
    { title: "Số lượt gặp", dataIndex: "count", key: "count" },
  ];

  const cardStyles = {
    totalPatients: {
      background: "linear-gradient(135deg, #330867, #30cfd0 )",
      color: "#fff",
    },
    newPatients: {
      background: "linear-gradient(135deg, #0ba360, #39F3BB)",
      color: "#333",
    },
    totalFavorites: {
      background: "linear-gradient(135deg, #ff0844, #fecfef)",
      color: "#fff",
    },
    totalBookings: {
      background: "linear-gradient(135deg, #7918F2, #a6c1ee)",
      color: "#fff",
    },
  };

  return (
    <div className="vh-100 overflow-auto p-4 no-scrollbar">
      {/* KPIs */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: 14,
              padding: 0,
              background: "linear-gradient(135deg, #4f46e5, #6366f1)",
            }}
            bodyStyle={{ padding: 20 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: 10,
                  borderRadius: 12,
                  fontSize: 26,
                  display: "flex",
                  alignItems: "center",
                  color: "#fff",
                }}
              >
                <TeamOutlined />
              </div>

              <div style={{ flex: 1, textAlign: "right" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>
                  Tổng bệnh nhân
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#fff" }}>
                  {stats.totalPatients}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: 14,
              background: "linear-gradient(135deg, #22c55e, #4ade80)",
            }}
            bodyStyle={{ padding: 20 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.25)",
                  padding: 10,
                  borderRadius: 12,
                  fontSize: 26,
                  display: "flex",
                  color: "#fff",
                }}
              >
                <UserAddOutlined />
              </div>

              <div style={{ flex: 1, textAlign: "right" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>
                  Bệnh nhân mới
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#fff" }}>
                  {stats.newPatients}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: 14,
              background: "linear-gradient(135deg, #ef4444, #fda4af)",
            }}
            bodyStyle={{ padding: 20 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.25)",
                  padding: 10,
                  borderRadius: 12,
                  fontSize: 26,
                  display: "flex",
                  color: "#fff",
                }}
              >
                <HeartOutlined />
              </div>

              <div style={{ flex: 1, textAlign: "right" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>
                  Lượt yêu thích
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#fff" }}>
                  {stats.totalFavorites}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: 14,
              background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
            }}
            bodyStyle={{ padding: 20 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.25)",
                  padding: 10,
                  borderRadius: 12,
                  fontSize: 26,
                  display: "flex",
                  color: "#fff",
                }}
              >
                <CalendarOutlined />
              </div>

              <div style={{ flex: 1, textAlign: "right" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>
                  Tổng lịch hẹn
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#fff" }}>
                  {totalBookings}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} sm={12} md={6} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: 12,
              background: "#fff",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  background: "#fde68a",
                  padding: 10,
                  borderRadius: 10,
                  fontSize: 24,
                }}
              >
                <ClockCircleOutlined />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 15, color: "black" }}>Chờ xác nhận</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>
                  {statusCounts.S1}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: 12,
              background: "#fff",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  background: "#bbf7d0",
                  padding: 10,
                  borderRadius: 10,
                  fontSize: 24,
                }}
              >
                <CheckCircleOutlined />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 15, color: "black" }}>Đã xác nhận</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>
                  {statusCounts.S2}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: 12,
              background: "#fff",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  background: "#bfdbfe",
                  padding: 10,
                  borderRadius: 10,
                  fontSize: 24,
                }}
              >
                <FlagOutlined />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 15, color: "black" }}>Hoàn thành</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>
                  {statusCounts.S4}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: 12,
              background: "#fff",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  background: "#fecaca",
                  padding: 10,
                  borderRadius: 10,
                  fontSize: 24,
                }}
              >
                <CloseCircleOutlined />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 15, color: "black" }}>Đã hủy</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>
                  {statusCounts.S5}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={12}>
          <Card
            title={
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Lịch hẹn theo ngày</span>
                <Select
                  value={filterRange}
                  onChange={setFilterRange}
                  style={{ width: 120 }}
                >
                  <Option value="7days">7 ngày</Option>
                  <Option value="14days">14 ngày</Option>
                  <Option value="all">Tất cả</Option>
                </Select>
              </div>
            }
          >
            <div style={{ width: "100%", height: "400px" }}>
              <Bar data={barData} options={barOptions} />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Tỷ lệ lịch hẹn theo trạng thái">
            <div style={{ width: "100%", height: "400px" }}>
              <Doughnut data={pieData} options={pieOptions} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Top triệu chứng */}
      {/* <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Top triệu chứng gặp nhiều nhất">
            <Table
              columns={columns}
              dataSource={stats.topSymptoms?.map((s, i) => ({
                key: i,
                ...s,
              }))}
              pagination={false}
            />
          </Card>
        </Col>
      </Row> */}
    </div>
  );
};

export default DoctorDashboard;
