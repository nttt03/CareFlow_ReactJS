import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useLocation, useHistory } from "react-router-dom";
import { getViewAppointmentForNoti } from "../../../services/userService";
import HomeHeader from "../../HomePage/HomeHeader";
import HomeFooter from "../../HomePage/HomeFooter";
import moment from "moment";
import { Spin, Alert, message } from "antd";
import { FormattedMessage } from "react-intl";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import "./ViewAppointment.scss";
import BackButton from "../../../components/BackButton";
import ModalMedicalRecord from "./ModalMedicalRecord";

export default function ViewAppointment() {
  const history = useHistory();
  const language = useSelector((state) => state.app.language);
  const user = useSelector((state) => state.user.userInfo);
  const location = useLocation();
  const { bookingId } = useParams();
  const [dataAppoinment, setDataAppoinment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOpenMedicalRecordModal, setIsOpenMedicalRecordModal] = useState(false);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(null);
  const [selectedPatientProfile, setSelectedPatientProfile] = useState(null);

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

  // --- XỬ LÝ MODAL HỒ SƠ BỆNH ÁN ---
  const handleOpenMedicalRecordModal = (item) => {
    // Lấy dữ liệu từ item (dataAppoinment)
    const medicalRecord = item?.medicalRecordData;
    const patientProfile = item?.patientData?.patientProfile;

    if (!medicalRecord && !patientProfile) {
      message.warning(
        language === "vi"
          ? "Không tìm thấy hồ sơ bệnh án chi tiết."
          : "No detailed medical record found."
      );
      return;
    }

    setIsOpenMedicalRecordModal(true);
    setSelectedMedicalRecord(medicalRecord);
    setSelectedPatientProfile(patientProfile);
  };

  const handleCloseMedicalRecordModal = () => {
    setIsOpenMedicalRecordModal(false);
    setSelectedMedicalRecord(null);
    setSelectedPatientProfile(null);
  };

  const renderStatus = (status) => {
    let className = "status-badge ";
    let text = "";

    switch (status) {
      case "S2":
        className += "status-confirmed";
        text = language === 'vi' ? 'Đã xác nhận' : 'Confirmed';
        break;
      case "S5":
        className += "status-cancel";
        text = language === 'vi' ? 'Đã hủy' : 'Canceled';
        break;
      case "S1":
        className += "status-waiting";
        text = language === 'vi' ? 'Chờ duyệt' : 'Waiting for approval';
        break;
      case "S4":
        className += "status-success";
        text = language === 'vi' ? 'Đã hoàn thành' : 'Completed';
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
        <div className="d-flex justify-content-center align-items-center py-5 h-100">
          <Spin size="medium">
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
            <CalendarOutlined /> {language === 'vi' ? 'Chi tiết lịch hẹn' : 'Appointment details'}
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

        {/* --- HIỂN THỊ HỒ SƠ BỆNH ÁN VÀ NÚT XEM CHI TIẾT --- */}
        {dataAppoinment.statusId === "S4" && (
            <div className="info-card equal-card flex-fill mb-4 p-4">
                <p className="text-success fw-bold">
                    <FormattedMessage id="patient.appointment-patient.medical-result" />{" "}
                    {dataAppoinment?.medicalRecordData?.description || (language === 'vi' ? "Chưa có kết quả chẩn đoán cuối cùng" : "No final diagnosis result")}
                </p>
                <div
                    onClick={() => handleOpenMedicalRecordModal(dataAppoinment)}
                    className="text-primary fw-bold text-end cursor-pointer"
                    style={{ cursor: "pointer" }}
                >
                    <FormattedMessage id="patient.appointment-patient.view-detail" />
                </div>
            </div>
        )}

        <div className="row g-4 align-items-stretch">
          <div className="col-lg-6 d-flex">
            <div className="info-card equal-card flex-fill">
              <div className="info-header info-header-blue">
                <ClockCircleOutlined /> {language === 'vi' ? 'Thông tin đặt lịch' : 'Scheduling information'}
              </div>
              <div className="info-body">
                <p>
                  <b><FormattedMessage id="patient.appointment-patient.date" /></b>{" "}
                  {moment(+dataAppoinment.date).format("dddd, DD/MM/YYYY")}
                </p>
                <p>
                  <b><FormattedMessage id="patient.appointment-patient.time" /></b> {language === 'vi' ? timeTypeDataPatient?.valueVi : timeTypeDataPatient?.valueEn}
                </p>
                <p>
                  <b><FormattedMessage id="patient.appointment-patient.symptoms" /></b> {dataAppoinment.symptoms || "Không có"}
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-6 d-flex">
            <div className="info-card equal-card flex-fill">
              <div className="info-header">
                <MedicineBoxOutlined /> {language === 'vi' ? 'Thông tin bác sĩ' : 'Doctor information'}
              </div>
              <div className="info-body">
                <p>
                  <b><FormattedMessage id="patient.appointment-patient.doctor" /></b> {infoDataDoctor?.fullName}
                </p>
                <p>
                  <b><FormattedMessage id="patient.appointment-patient.position" /></b> {language === 'vi' ? infoDataDoctor?.positionData?.valueVi : infoDataDoctor?.positionData?.valueEn}
                </p>
                <p>
                  <b><FormattedMessage id="patient.appointment-patient.specialty" /></b> {doctorInfoData?.specialtyData?.name}
                </p>
                <p>
                  <b><FormattedMessage id="patient.appointment-patient.hospital" /></b> {doctorInfoData?.hospital?.name}
                </p>
                <p>
                  <b><FormattedMessage id="patient.appointment-patient.address" /></b> {doctorInfoData?.hospital?.addressDetail},{" "}
                  {doctorInfoData?.hospital?.provinceData?.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    
      <ModalMedicalRecord
          isOpen={isOpenMedicalRecordModal}
          onClose={handleCloseMedicalRecordModal}
          medicalRecordData={selectedMedicalRecord}
          patientProfileData={selectedPatientProfile}
          language={language}
          userInfo={user}
      />

      {!isSystemPage && <HomeFooter />}
    </>
  );
}