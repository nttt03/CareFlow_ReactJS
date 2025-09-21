import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Table } from "antd";
import {
  CalendarOutlined,
  UserAddOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Column, Pie } from "@ant-design/plots";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalAppointments: 120,
    todayAppointments: 15,
    cancelledAppointments: 5,
    newPatients: 8,
  });

  const [appointmentsData, setAppointmentsData] = useState([
    { date: "2025-09-01", value: 10 },
    { date: "2025-09-02", value: 20 },
    { date: "2025-09-03", value: 15 },
    { date: "2025-09-04", value: 25 },
    { date: "2025-09-05", value: 30 },
  ]);

  const [specialtyData, setSpecialtyData] = useState([
    { type: "Nội tổng quát", value: 40 },
    { type: "Nhi khoa", value: 25 },
    { type: "Tai - Mũi - Họng", value: 20 },
    { type: "Da liễu", value: 15 },
  ]);

  const [recentAppointments, setRecentAppointments] = useState([
    {
      key: 1,
      patient: "Nguyễn Văn A",
      doctor: "BS. Minh",
      time: "09:00 20/09/2025",
      status: "Đã xác nhận",
    },
    {
      key: 2,
      patient: "Trần Thị B",
      doctor: "BS. Lan",
      time: "10:30 20/09/2025",
      status: "Chờ xác nhận",
    },
    {
      key: 3,
      patient: "Lê Văn C",
      doctor: "BS. Hùng",
      time: "14:00 20/09/2025",
      status: "Đã hủy",
    },
  ]);

  const columns = [
    { title: "Bệnh nhân", dataIndex: "patient", key: "patient" },
    { title: "Bác sĩ", dataIndex: "doctor", key: "doctor" },
    { title: "Thời gian", dataIndex: "time", key: "time" },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
  ];

  const columnConfig = {
    data: appointmentsData,
    xField: "date",
    yField: "value",
    label: { position: "top" },
    color: "#1677ff",
  };

  const pieConfig = {
    data: specialtyData,
    angleField: "value",
    colorField: "type",
    radius: 0.9,
    label: {
      content: ({ type, value }) => `${type}: ${value}`,
      style: { fontSize: 12 },
    },
  };

  return (
    <div style={{ padding: 20 }}>
      {/* KPIs */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số lịch hẹn"
              value={stats.totalAppointments}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Lịch hẹn hôm nay"
              value={stats.todayAppointments}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã hủy"
              value={stats.cancelledAppointments}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Bệnh nhân mới"
              value={stats.newPatients}
              prefix={<UserAddOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={12}>
          <Card title="Lịch hẹn theo ngày">
            <Column {...columnConfig} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Tỷ lệ chuyên khoa">
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>

      {/* Recent appointments */}
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Lịch hẹn gần đây">
            <Table
              columns={columns}
              dataSource={recentAppointments}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
