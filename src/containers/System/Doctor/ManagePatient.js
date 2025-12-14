import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import "./ManagePatient.scss";
import DatePicker from "../../../components/Input/DatePicker";
import {
  getAllPatientForDoctor,
  postSendRemedy,
  postMedicalRecord,
  UpdateInfoPatient
} from "../../../services/userService";
import moment from "moment";
import { LANGUAGES } from "../../../utils";
import RemedyModal from "./RemedyModal";
import { toast } from "react-toastify";
import {
  Form,
  Input,
  Button,
  Upload,
  Card,
  Row,
  Col,
  message,
  Select,
  DatePicker as AntdDatePicker
} from "antd";
import { UploadOutlined, LeftOutlined, EditFilled, CheckOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

const ManagePatient = () => {
  const user = useSelector((state) => state.user.userInfo);
  const language = useSelector((state) => state.app.language);
  const [searchName, setSearchName] = useState("");

  const [currentDate, setCurrentDate] = useState(
    moment(new Date()).startOf("day").valueOf()
  );
  const [editPatientForm, setEditPatientForm] = useState({
    fullName: "",
    dateOfBirth: "",
    phoneNumber: "",
    gender: "",
    addressDetail: "",
  });
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [dataPatient, setDataPatient] = useState([]);
  const [isOpenRemedyModal, setIsOpenRemedyModal] = useState(false);
  const [dataModal, setDataModal] = useState({});
  const [isShowLoading, setIsShowLoading] = useState(false);
  const [loadingMedicalRecord, setLoadingMedicalRecord] = useState(false);
  const [screen, setScreen] = useState("LIST");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [recordForm, setRecordForm] = useState({
    description: "",
    height: "",
    weight: "",
    underlying_diseases: "",
    allergies: "",
    medical_history: "",
    file: null,
  });

  useEffect(() => {
    if (selectedPatient?.patientData) {
      const rawDate = selectedPatient.patientData.dateOfBirth;

      let displayDate = "";

      if (rawDate) {
        if (rawDate.includes("-") && rawDate.length === 10) {
          displayDate = dayjs(rawDate).format("DD/MM/YYYY");
        }
        else if (rawDate.includes("/")) {
          displayDate = rawDate;
        }
      }

      const genderKey = selectedPatient.patientData.genderData?.valueVi === "Nam" 
      ? "M" 
      : selectedPatient.patientData.genderData?.valueVi === "Nữ" 
        ? "F" 
        : selectedPatient.patientData.gender || "M";

      setEditPatientForm({
        fullName: selectedPatient.patientData.fullName || "",
        dateOfBirth: displayDate,
        phoneNumber: selectedPatient.patientData.phoneNumber || "",
        gender: genderKey,
        addressDetail: selectedPatient.patientData.addressDetail || "",
      });
    }
  }, [selectedPatient]);

  const handleSavePatientInfo = async () => {
    const dbDate = editPatientForm.dateOfBirth
    ? dayjs(editPatientForm.dateOfBirth, "DD/MM/YYYY").format("YYYY-MM-DD")
    : null;

    const payload = {
      userId: selectedPatient?.patientData?.id,
      fullName: editPatientForm.fullName,
      dateOfBirth: dbDate,
      phoneNumber: editPatientForm.phoneNumber,
      gender: editPatientForm.gender,
      addressDetail: editPatientForm.addressDetail,
    };

    try {
      let res = await UpdateInfoPatient(payload);

      if (res && res.errCode === 0) {
        message.success("Cập nhật thông tin bệnh nhân thành công!");

        // Cập nhật lại selectedPatient (vẫn giữ định dạng DD/MM/YYYY để hiển thị)
        setSelectedPatient(prev => ({
          ...prev,
          patientData: {
            ...prev.patientData,
            fullName: editPatientForm.fullName,
            dateOfBirth: editPatientForm.dateOfBirth,
            phoneNumber: editPatientForm.phoneNumber,
            gender: editPatientForm.gender,
            addressDetail: editPatientForm.addressDetail,
            genderData: {
              ...prev.patientData.genderData,
              keyMap: editPatientForm.gender,
              valueVi: editPatientForm.gender === "M" ? "Nam" : editPatientForm.gender === "F" ? "Nữ" : "Khác",
              valueEn: editPatientForm.gender === "M" ? "Male" : editPatientForm.gender === "F" ? "Female" : "Other",
            },
          },
        }));

        setIsEditingPatient(false);
      } else {
        message.error(res.errMessage || "Cập nhật thất bại");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra");
    }
  };

  const handleSaveMedicalRecord = async () => {
    const formData = new FormData();
    formData.append("patientId", selectedPatient?.patientId);
    formData.append("doctorId", user?.id);
    formData.append("bookingId", selectedPatient?.id);
    formData.append("description", recordForm.description);
    formData.append("height", recordForm.height);
    formData.append("weight", recordForm.weight);
    formData.append("underlying_diseases", recordForm.underlying_diseases);
    formData.append("allergies", recordForm.allergies);
    formData.append("medical_history", recordForm.medical_history);
    if (recordForm.file) formData.append("file", recordForm.file);
    formData.append("updateBy", user?.id);
    setLoadingMedicalRecord(true);
    let res = await postMedicalRecord(formData);

    if (res && res.errCode === 0) {
      message.success(
        language === "vi"
          ? "Lưu hồ sơ bệnh án thành công!"
          : "Medical record saved successfully!"
      );
      setScreen("LIST");
      setIsOpenRemedyModal(false);
    } else {
      setIsOpenRemedyModal(false);
      message.error(
        language === "vi"
          ? "Lưu hồ sơ bệnh án thất bại!"
          : "Failed to save medical record!"
      );
    }
    setLoadingMedicalRecord(false);
  };

  const getDataPatient = useCallback(async () => {
    if (!user?.id) return;
    let formatedDate = new Date(currentDate).getTime();
    let res = await getAllPatientForDoctor({
      doctorId: user.id,
      date: formatedDate,
      status: "S2",
    });
    if (res && res.errCode === 0) {
      setDataPatient(res.data);
    }
  }, [currentDate, user]);

  useEffect(() => {
    getDataPatient();
  }, [getDataPatient]);

  const handleOnChangeDatePicker = async (date) => {
    setCurrentDate(date[0]);
  };

  const handleBtnConfirm = (item) => {
    let data = {
      doctorId: item.doctorId,
      patientId: item.patientId,
      email: item.patientData.email,
      timeType: item.timeType,
      patientName: item.patientData.fullName,
      doctorName: item.infoDataDoctor.fullName,
      bookingId: item.id,
    };
    setIsOpenRemedyModal(true);
    setDataModal(data);
  };

  const closeRemedyModal = () => {
    setIsOpenRemedyModal(false);
    setDataModal({});
  };

  const sendRemedy = async (dataChild) => {
    setIsShowLoading(true);
    let res = await postSendRemedy({
      email: dataChild.email,
      imgBase64: dataChild.imgBase64,
      doctorId: dataModal.doctorId,
      patientId: dataModal.patientId,
      timeType: dataModal.timeType,
      patientName: dataModal.patientName,
      doctorName: dataModal.doctorName,
      bookingId: dataModal.bookingId,
      language: language,
    });
    if (res && res.errCode === 0) {
      setIsShowLoading(false);
      toast.success(
        language === "vi"
          ? "Gửi đơn thuốc thành công!"
          : "Prescription sent successfully!"
      );
      closeRemedyModal();
      await getDataPatient();
    } else {
      setIsShowLoading(false);
      toast.error(
        language === "vi"
          ? "Gửi đơn thuốc thất bại!"
          : "Failed to send prescription!"
      );
    }
  };

  const handleCreateMedicalRecord = (item) => {
    setSelectedPatient(item);
    setRecordForm({
      description: "",
      height: item?.patientData?.patientProfile?.height || "",
      weight: item?.patientData?.patientProfile?.weight || "",
      underlying_diseases:
        item?.patientData?.patientProfile?.underlying_diseases || "",
      allergies: item?.patientData?.patientProfile?.allergies || "",
      medical_history:
        item?.patientData?.patientProfile?.medical_history || "",
      file: null,
    });
    setScreen("CREATE");
  };

  const filteredPatients = dataPatient.filter((item) => {
    const patientName = item?.patientData?.fullName || "";
    return patientName
      .toLowerCase()
      .includes(searchName.trim().toLowerCase());
  });

  const renderScreen = () => {
    switch (screen) {
      case "CREATE":
        return (
          <div className="patient-detail-container vh-100 overflow-auto bg-white p-3 no-scrollbar">
            <span
              className="text-primary ms-2"
              style={{ cursor: "pointer", display: "inline-flex", alignItems: "center" }}
              onClick={() => setScreen("LIST")}
            >
              <LeftOutlined style={{ marginRight: 6 }} />
              {language === "vi" ? "Quay lại danh sách" : "Back to list"}
            </span>
            <h2 className="mb-4 title">
              {language === "vi"
                ? "Khám lập hồ sơ bệnh án"
                : "Create Medical Record"}
            </h2>
            
            <Card
              type="inner"
              title={
                <div className="d-flex justify-content-between align-items-center">
                  {language === "vi" ? "Thông tin bệnh nhân" : "Patient Information"}
                  {isEditingPatient ? (
                    <CheckOutlined
                      style={{ fontSize: 18, color: "#52c41a", cursor: "pointer" }}
                      onClick={() => setIsEditingPatient(false)}
                    />
                  ) : (
                    <EditFilled
                      style={{ fontSize: 18, color: "#1890ff", cursor: "pointer" }}
                      onClick={() => setIsEditingPatient(true)}
                    />
                  )}
                </div>
              }
            >
              {isEditingPatient ? (
                // === CHẾ ĐỘ CHỈNH SỬA ===
                <Form layout="vertical">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item label={language === "vi" ? "Họ và tên" : "Full Name"}>
                        <Input
                          value={editPatientForm.fullName}
                          onChange={(e) =>
                            setEditPatientForm({ ...editPatientForm, fullName: e.target.value })
                          }
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Form.Item label={language === "vi" ? "Ngày sinh" : "Date of Birth"}>
                        <AntdDatePicker
                          style={{ width: "100%" }}
                          format="DD/MM/YYYY"
                          placeholder="DD/MM/YYYY"
                          value={
                            editPatientForm.dateOfBirth
                              ? dayjs(editPatientForm.dateOfBirth, "DD/MM/YYYY")
                              : null
                          }
                          onChange={(date, dateString) => {
                            setEditPatientForm({
                              ...editPatientForm,
                              dateOfBirth: dateString || "",
                            });
                          }}
                          
                        />
                      </Form.Item>
                  </Col>

                    <Col xs={24} sm={12}>
                      <Form.Item label={language === "vi" ? "Số điện thoại" : "Phone Number"}>
                        <Input
                          value={editPatientForm.phoneNumber}
                          onChange={(e) =>
                            setEditPatientForm({
                              ...editPatientForm,
                              phoneNumber: e.target.value,
                            })
                          }
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Form.Item label={language === "vi" ? "Giới tính" : "Gender"}>
                        <Select
                          value={editPatientForm.gender}
                          onChange={(value) =>
                            setEditPatientForm({ ...editPatientForm, gender: value })
                          }
                        >
                          <Option value="M">Nam</Option>
                          <Option value="F">Nữ</Option>
                          <Option value="O">Khác</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24}>
                      <Form.Item label={language === "vi" ? "Địa chỉ" : "Address"}>
                        <Input.TextArea
                          rows={2}
                          value={editPatientForm.addressDetail}
                          onChange={(e) =>
                            setEditPatientForm({
                              ...editPatientForm,
                              addressDetail: e.target.value,
                            })
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <div>
                    <Button type="primary" onClick={handleSavePatientInfo}>
                      {language === "vi" ? "Lưu thay đổi" : "Save Changes"}
                    </Button>
                    <Button style={{ marginLeft: 8 }} onClick={() => setIsEditingPatient(false)}>
                      {language === "vi" ? "Hủy" : "Cancel"}
                    </Button>
                  </div>
                </Form>
              ) : (
                // === CHẾ ĐỘ XEM THÔNG THƯỜNG ===
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <p><b>{language === "vi" ? "Họ và tên:" : "Full Name:"}</b> {selectedPatient?.patientData?.fullName}</p>
                    
                    <p>
                      <b>{language === "vi" ? "Giới tính:" : "Gender:"}</b>{" "}
                      {selectedPatient?.patientData?.genderData?.valueVi || "—"}
                    </p>
                    <p><b>{language === "vi" ? "Ngày sinh:" : "Date of Birth:"}</b>{" "}
                      {selectedPatient?.patientData?.dateOfBirth || "—"}
                    </p>
                  </Col>

                  <Col xs={24} sm={12}>
                    <p><b>{language === "vi" ? "SĐT:" : "Phone:"}</b> {selectedPatient?.patientData?.phoneNumber || "—"}</p>
                    <p><b>{language === "vi" ? "Địa chỉ:" : "Address:"}</b>{" "}
                      {selectedPatient?.patientData?.addressDetail
                        ? `${selectedPatient?.patientData?.addressDetail}, ${selectedPatient?.patientData?.provinceData?.name || ""}`
                        : "—"}
                    </p>
                    <p><b>{language === "vi" ? "Thời gian khám:" : "Appointment time:"}</b>{" "}
                      {selectedPatient?.date
                        ? moment(Number(selectedPatient.date)).format("DD/MM/YYYY")
                        : "—"} –{" "}
                      {language === LANGUAGES.VI
                        ? selectedPatient?.timeTypeDataPatient?.valueVi
                        : selectedPatient?.timeTypeDataPatient?.valueEn}
                    </p>
                  </Col>
                </Row>
              )}
            </Card>
            
            <Card
              type="inner"
              title={
                language === "vi"
                  ? "Thông tin bệnh án"
                  : "Medical Record Information"
              }
            >
              <Form layout="vertical" onFinish={handleSaveMedicalRecord}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={language === "vi" ? "Chiều cao" : "Height"}
                      name="height"
                    >
                      <Input
                        type="number"
                        value={recordForm.height}
                        onChange={(e) =>
                          setRecordForm({
                            ...recordForm,
                            height: e.target.value,
                          })
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        language === "vi" ? "Cân nặng (kg)" : "Weight (kg)"
                      }
                      name="weight"
                    >
                      <Input
                        type="number"
                        value={recordForm.weight}
                        onChange={(e) =>
                          setRecordForm({
                            ...recordForm,
                            weight: e.target.value,
                          })
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        language === "vi" ? "Bệnh nền" : "Underlying diseases"
                      }
                      name="underlying_diseases"
                    >
                      <Input
                        value={recordForm.underlying_diseases}
                        onChange={(e) =>
                          setRecordForm({
                            ...recordForm,
                            underlying_diseases: e.target.value,
                          })
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={language === "vi" ? "Dị ứng" : "Allergies"}
                      name="allergies"
                    >
                      <Input
                        value={recordForm.allergies}
                        onChange={(e) =>
                          setRecordForm({
                            ...recordForm,
                            allergies: e.target.value,
                          })
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={
                    language === "vi" ? "Lịch sử bệnh" : "Medical history"
                  }
                  name="medical_history"
                >
                  <Input.TextArea
                    rows={3}
                    value={recordForm.medical_history}
                    onChange={(e) =>
                      setRecordForm({
                        ...recordForm,
                        medical_history: e.target.value,
                      })
                    }
                  />
                </Form.Item>

                <Form.Item
                  label={
                    language === "vi"
                      ? "Kết luận khám bệnh"
                      : "Medical conclusion"
                  }
                  name="description"
                >
                  <Input.TextArea
                    rows={4}
                    value={recordForm.description}
                    onChange={(e) =>
                      setRecordForm({
                        ...recordForm,
                        description: e.target.value,
                      })
                    }
                  />
                </Form.Item>

                <Form.Item
                  label={
                    language === "vi"
                      ? "Tệp đính kèm (nếu có)"
                      : "Attachment (if any)"
                  }
                  name="file"
                >
                  <Upload
                    beforeUpload={(file) => {
                      setRecordForm({ ...recordForm, file });
                      return false;
                    }}
                  >
                    <Button icon={<UploadOutlined />}>
                      {language === "vi" ? "Chọn tệp" : "Choose file"}
                    </Button>
                  </Upload>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    {loadingMedicalRecord ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        {language === "vi" ? "Đang lưu..." : "Saving..."}
                      </>
                    ) : language === "vi" ? (
                      "Lưu hồ sơ bệnh án"
                    ) : (
                      "Save Medical Record"
                    )}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        );

      case "LIST":
      default:
        return (
          <div className="manage-patient-container">
            <div className="m-p-title">
              {language === "vi"
                ? "Quản lý bệnh nhân khám bệnh"
                : "Manage patient examinations"}
            </div>
            <div className="manage-patient-body row">
              <div className="row mb-3">
                <div className="col-4">
                  <label className="form-label">
                    {language === "vi" ? "Chọn ngày khám" : "Select examination date"}
                  </label>
                  <DatePicker
                    className="form-control"
                    onChange={handleOnChangeDatePicker}
                    value={currentDate}
                  />
                </div>

                <div className="col-4">
                  <label className="form-label">
                    {language === "vi" ? "Tìm theo tên bệnh nhân" : "Search patient name"}
                  </label>
                  <Input
                    placeholder={
                      language === "vi"
                        ? "Nhập tên bệnh nhân..."
                        : "Enter patient name..."
                    }
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    allowClear
                  />
                </div>
              </div>
              <div className="col-12 table-manage-patient">
                <table style={{ width: "100%" }}>
                  <tbody>
                    <tr>
                      <th>{language === "vi" ? "STT" : "No."}</th>
                      <th>
                        {language === "vi"
                          ? "Thời gian khám"
                          : "Examination time"}
                      </th>
                      <th>{language === "vi" ? "Họ và tên" : "Full Name"}</th>
                      <th>{language === "vi" ? "Giới tính" : "Gender"}</th>
                      <th>{language === "vi" ? "Địa chỉ" : "Address"}</th>
                      <th>{language === "vi" ? "Thao tác" : "Actions"}</th>
                    </tr>

                    {filteredPatients && filteredPatients.length > 0 ? (
                      filteredPatients.map((item, index) => {
                        let gender =
                          language === LANGUAGES.VI
                            ? item?.patientData?.genderData?.valueVi
                            : item?.patientData?.genderData?.valueEn;
                        let time =
                          language === LANGUAGES.VI
                            ? item?.timeTypeDataPatient?.valueVi
                            : item?.timeTypeDataPatient?.valueEn;

                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{time}</td>
                            <td>{item?.patientData?.fullName}</td>
                            <td>{gender}</td>
                            <td>
                              {item?.patientData?.addressDetail},{" "}
                              {item?.patientData?.provinceData?.name}
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-success"
                                  onClick={() => handleBtnConfirm(item)}
                                >
                                  <i className="bi bi-check-circle me-1"></i>
                                  {language === "vi" ? "Xác nhận" : "Confirm"}
                                </button>
                                <button
                                  className="btn btn-primary"
                                  onClick={() => handleCreateMedicalRecord(item)}
                                >
                                  <i className="bi bi-file-earmark-medical me-1"></i>
                                  {language === "vi"
                                    ? "Lập hồ sơ"
                                    : "Create record"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6">
                          {language === "vi"
                            ? "Không có dữ liệu"
                            : "No data available"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {renderScreen()}

      <RemedyModal
        isOpenModal={isOpenRemedyModal}
        dataModal={dataModal}
        closeRemedyModal={closeRemedyModal}
        sendRemedy={sendRemedy}
        isShowLoading={isShowLoading}
      />
    </>
  );
};

export default ManagePatient;
