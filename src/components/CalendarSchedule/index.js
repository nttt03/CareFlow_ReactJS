import React, { useEffect, useState } from "react";
import {
  Calendar,
  Badge,
  Spin,
  message,
  ConfigProvider,
  Tooltip,
  Typography,
} from "antd";
import { MedicineBoxOutlined, UserSwitchOutlined } from "@ant-design/icons";
import viVN from "antd/locale/vi_VN";
import enUS from "antd/locale/en_US";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import "dayjs/locale/en";
import { getBookingsForCalendar } from "../../services/userService";
import { useSelector } from "react-redux";
import "./index.scss";

const { Text } = Typography;

const CalendarSchedule = () => {
  const userInfor = useSelector((state) => state.user.userInfo);
  const language = useSelector((state) => state.app.language);
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  /** 🔹 Gọi API lấy lịch hẹn theo tháng + role */
  const fetchBookings = async (monthValue) => {
    try {
      setLoading(true);
      const startDate = dayjs(monthValue).startOf("month").format("YYYY-MM-DD");
      const endDate = dayjs(monthValue).endOf("month").format("YYYY-MM-DD");

      const params = {
        startDate,
        endDate,
        roleId: userInfor?.roleId,
        userId: userInfor?.id,
        hospitalId: userInfor?.hospitalId,
      };

      const res = await getBookingsForCalendar(params);

      if (res && res.errCode === 0) {
        setBookings(res.data || []);
        setSummary(res.summary || {});
      } else {
        message.error(
          language === "vi"
            ? "Không thể tải lịch hẹn"
            : "Unable to load appointments"
        );
      }
    } catch (error) {
      console.error(error);
      message.error(
        language === "vi"
          ? "Lỗi khi tải dữ liệu lịch hẹn"
          : "Error while loading appointment data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 🔹 Cập nhật ngôn ngữ cho dayjs
    dayjs.locale(language === "vi" ? "vi" : "en");
    fetchBookings(currentMonth);
  }, [currentMonth, language]);

  const onPanelChange = (value) => setCurrentMonth(value);

  /** 🗓️ Hiển thị trong từng ô ngày */
  const dateCellRender = (value) => {
    const dateKey = value.format("YYYY-MM-DD");
    const data = summary[dateKey];
    if (!data) return null;

    const total = data.total || 0;
    const { confirmed, done, cancelled, pending } = data;

    const tooltipContent = (
      <div>
        <Text strong>
          {language === "vi"
            ? `Tổng: ${total} lịch hẹn`
            : `Total: ${total} appointments`}
        </Text>
        <ul style={{ paddingLeft: 10, marginTop: 5, listStyle: "none" }}>
          <li>
            <Badge color="#1890ff" />{" "}
            {language === "vi" ? "Đã xác nhận" : "Confirmed"}: {confirmed || 0}
          </li>
          <li>
            <Badge color="#52c41a" />{" "}
            {language === "vi" ? "Đã khám" : "Completed"}: {done || 0}
          </li>
          <li>
            <Badge color="#faad14" />{" "}
            {language === "vi" ? "Chờ xác nhận" : "Pending"}: {pending || 0}
          </li>
          <li>
            <Badge color="#f5222d" />{" "}
            {language === "vi" ? "Đã huỷ" : "Cancelled"}: {cancelled || 0}
          </li>
        </ul>

        {userInfor?.roleId === "R4" &&
          Object.keys(data.byDoctor).length > 0 && (
            <>
              <Text strong>{language === "vi" ? "Bác sĩ:" : "Doctor:"}</Text>
              <ul style={{ paddingLeft: 5, listStyle: "none", margin: 0 }}>
                {Object.entries(data.byDoctor).map(([doctor, count]) => (
                  <li key={doctor}>
                    <UserSwitchOutlined
                      style={{ fontSize: 24, color: "#1890ff" }}
                    />{" "}
                    {doctor}: {count}
                  </li>
                ))}
              </ul>
            </>
          )}

        {userInfor?.roleId === "R1" &&
          Object.keys(data.byHospital).length > 0 && (
            <>
              <Text strong>
                {language === "vi" ? "Bệnh viện:" : "Hospital:"}
              </Text>
              <ul style={{ paddingLeft: 5, listStyle: "none", margin: 0 }}>
                {Object.entries(data.byHospital).map(([hospital, count]) => (
                  <li key={hospital}>
                    <MedicineBoxOutlined
                      style={{ fontSize: 24, color: "#1890ff" }}
                    />{" "}
                    {hospital}: {count}
                  </li>
                ))}
              </ul>
            </>
          )}
      </div>
    );

    return (
      <Tooltip title={tooltipContent} placement="top">
        <div style={{ textAlign: "center" }}>
          <Badge count={total} style={{ backgroundColor: "#1890ff" }} />
        </div>
      </Tooltip>
    );
  };

  return (
    <ConfigProvider locale={language === "vi" ? viVN : enUS}>
      <Spin spinning={loading}>
        <div className="px-5 py-3 bg-white rounded-lg shadow-md vh-100 no-scrollbar calandar-container">
          <h3 className="text-lg font-semibold mb-4 text-center">
            {language === "vi"
              ? "Lịch hẹn trong tháng"
              : "Appointment schedule for the month"}
          </h3>
          <Calendar
            className="calendar-schedule vh-100 no-scrollbar"
            dateCellRender={dateCellRender}
            onPanelChange={onPanelChange}
          />
        </div>
      </Spin>
    </ConfigProvider>
  );
};

export default CalendarSchedule;
