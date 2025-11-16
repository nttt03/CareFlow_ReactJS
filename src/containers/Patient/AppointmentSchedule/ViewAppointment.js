import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useLocation, useHistory } from "react-router-dom";
import { getViewAppointmentForNoti } from "../../../services/userService";
import HomeHeader from "../../HomePage/HomeHeader";
import HomeFooter from "../../HomePage/HomeFooter";
import moment from "moment";
import { Spin, Alert } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import "./ViewAppointment.scss";
import BackButton from "../../../components/BackButton";

export default function ViewAppointment() {
  const history = useHistory();
  const language = useSelector((state) => state.app.language);
  const user = useSelector((state) => state.user.userInfo);
  const location = useLocation();
  const { bookingId } = useParams();
  const [dataAppoinment, setDataAppoinment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isSystemPage =
    location.pathname.startsWith("/system") ||
    location.pathname.startsWith("/doctor") ||
    location.pathname.startsWith("/leader-hospital");

  const fetchAppoinmentForNoti = async () => {
    try {
      const res = await getViewAppointmentForNoti(bookingId);
      if (res && res.errCode === 0) setDataAppoinment(res.dataAppointments);
      else setError(res?.errMessage || "Không tìm thấy lịch hẹn");
    } catch (e) {
      setError("Lỗi hệ thống. Vui lòng thử lại.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppoinmentForNoti();
  }, [bookingId]);

  const renderStatus = (status) => {
    let className = "status-badge ";
    let text = "";

    switch (status) {
      case "S2":
        className += "status-confirmed";
        text = "Đã xác nhận";
        break;
      case "S5":
        className += "status-cancel";
        text = "Đã hủy";
        break;
      case "S1":
        className += "status-waiting";
        text = "Chờ duyệt";
        break;
      case "S4":
        className += "status-success";
        text = "Đã hoàn thành";
        break;
      default:
        className += "status-default";
        text = dataAppoinment?.statusData?.valueVi;
    }

    return <span className={className}>{text}</span>;
  };

  const handleBack = () => {
    switch (user?.roleId) {
      case "R1":
        return "/system/waiting-approval";
      case "R2":
        return "/doctor/waiting-approval";
      case "R4":
        return "/leader-hospital/waiting-approval";
      default:
        return "/";
    }
  };

  if (loading)
    return (
      <>
        {!isSystemPage && <HomeHeader />}
        <div className="d-flex justify-content-center align-items-center py-5">
          <Spin size="large" tip="Đang tải thông tin...">
            <div style={{ width: 0, height: 0 }}></div>
          </Spin>
        </div>
        {!isSystemPage && <HomeFooter />}
      </>
    );

  if (error)
    return (
      <>
        {!isSystemPage && <HomeHeader />}
        <div className="container py-5">
          <Alert message="Lỗi" description={error} type="error" showIcon />
        </div>
        {!isSystemPage && <HomeFooter />}
      </>
    );

  if (!dataAppoinment)
    return (
      <>
        {!isSystemPage && <HomeHeader />}
        <div className="container py-5">
          <Alert
            message="Không tìm thấy"
            description="Lịch hẹn không tồn tại hoặc đã bị xóa."
            type="warning"
            showIcon
          />
        </div>
        {!isSystemPage && <HomeFooter />}
      </>
    );

  const { rejectReason, timeTypeDataPatient, infoDataDoctor, doctorInfoData } =
    dataAppoinment;

  return (
    <>
      {!isSystemPage && <HomeHeader />}

      <div className="container h-100 view-appointment-container">
        <BackButton
          to={() => handleBack()}
          label={language === "vi" ? "Quay lại" : "Back"}
          style={{ color: "#0071ba" }}
        />
        <div className="text-center mb-4">
          <h2 className="page-title">
            <CalendarOutlined /> Chi tiết lịch hẹn
          </h2>
          <div className="mt-2">{renderStatus(dataAppoinment.statusId)}</div>
        </div>

        {rejectReason && (
          <div className="mb-4">
            <Alert
              message="Lý do hủy:"
              description={rejectReason}
              type="error"
              showIcon
              icon={<AlertOutlined />}
            />
          </div>
        )}

        <div className="row g-4 align-items-stretch">
          <div className="col-lg-6 d-flex">
            <div className="info-card equal-card flex-fill">
              <div className="info-header info-header-blue">
                <ClockCircleOutlined /> Thông tin đặt lịch
              </div>
              <div className="info-body">
                <p>
                  <b>Ngày khám:</b>{" "}
                  {moment(+dataAppoinment.date).format("dddd, DD/MM/YYYY")}
                </p>
                <p>
                  <b>Giờ khám:</b> {timeTypeDataPatient?.valueVi}
                </p>
                <p>
                  <b>Triệu chứng:</b> {dataAppoinment.symptoms || "Không có"}
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-6 d-flex">
            <div className="info-card equal-card flex-fill">
              <div className="info-header">
                <MedicineBoxOutlined /> Thông tin bác sĩ
              </div>
              <div className="info-body">
                <p>
                  <b>Bác sĩ:</b> {infoDataDoctor?.fullName}
                </p>
                <p>
                  <b>Chức danh:</b> {infoDataDoctor?.positionData?.valueVi}
                </p>
                <p>
                  <b>Chuyên khoa:</b> {doctorInfoData?.specialtyData?.name}
                </p>
                <p>
                  <b>Bệnh viện:</b> {doctorInfoData?.hospital?.name}
                </p>
                <p>
                  <b>Địa chỉ:</b> {doctorInfoData?.hospital?.addressDetail},{" "}
                  {doctorInfoData?.hospital?.provinceData?.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isSystemPage && <HomeFooter />}
    </>
  );
}
