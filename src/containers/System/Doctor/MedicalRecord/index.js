import React, { useEffect, useState, useCallback } from "react";
import { Modal } from "antd";
import { useSelector } from "react-redux";
import "../ManagePatient.scss";
import {
  getAllPatientForDoctor,
  postMedicalRecord,
  deleteMedicalRecord,
} from "../../../../services/userService";
import moment from "moment";
import { LANGUAGES } from "../../../../utils";
import { formatDate } from "../../../../utils";
import { Buffer } from "buffer";
import {
  Spin,
  Form,
  Input,
  Button,
  Upload,
  Card,
  Row,
  Col,
  message,
} from "antd";
import {
  UploadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  LeftOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const MedicalRecord = () => {
  const user = useSelector((state) => state.user.userInfo);
  const language = useSelector((state) => state.app.language);

  const [dataPatient, setDataPatient] = useState([]);
  const [uniquePatients, setUniquePatients] = useState([]);
  const [isShowLoading, setIsShowLoading] = useState(false);
  const [screen, setScreen] = useState("LIST");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterDate, setFilterDate] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [recordForm, setRecordForm] = useState({
    id: "",
    description: "",
    height: "",
    weight: "",
    underlying_diseases: "",
    allergies: "",
    medical_history: "",
    file: null,
  });

  const getDataPatient = useCallback(async () => {
    if (!user?.id) return;

    let params = {
      doctorId: user.id,
      status: "S4",
    };

    if (filterDate) {
      params.date = moment(filterDate).startOf("day").valueOf();
    }

    let res = await getAllPatientForDoctor(params);
    if (res && res.errCode === 0) {
      setDataPatient(res.data);
    }
  }, [user, filterDate]);

  useEffect(() => {
    getDataPatient();
  }, [getDataPatient]);

  useEffect(() => {
    const map = {};
    dataPatient.forEach((booking) => {
      const pid = booking.patientId;
      if (!map[pid]) {
        map[pid] = {
          ...booking.patientData,
          bookings: [],
        };
      }
      map[pid].bookings.push({
        id: booking.id,
        symptoms: booking.symptoms,
        date: booking.date,
        timeType: booking.timeType,
        timeTypeDataPatient: booking.timeTypeDataPatient,
      });
    });
    setUniquePatients(Object.values(map));
  }, [dataPatient]);

  const handleSaveMedicalRecord = async () => {
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!selectedPatient?.id || !selectedBooking?.id || !user?.id) {
        message.error("Dữ liệu bệnh nhân, lịch hẹn hoặc bác sĩ không hợp lệ!");
        return;
      }

      // Kiểm tra file size (nếu có)
      if (recordForm.file && recordForm.file.size > 5 * 1024 * 1024) {
        message.error("File đính kèm quá lớn, vui lòng chọn file dưới 5MB!");
        return;
      }

      setIsShowLoading(true);

      const formData = new FormData();
      if (recordForm.id) formData.append("id", recordForm.id);
      formData.append("patientId", selectedPatient.id);
      formData.append("doctorId", user.id);
      formData.append("bookingId", selectedBooking.id);
      formData.append("description", recordForm.description || "");
      formData.append("height", recordForm.height || "");
      formData.append("weight", recordForm.weight || "");
      formData.append(
        "underlying_diseases",
        recordForm.underlying_diseases || ""
      );
      formData.append("allergies", recordForm.allergies || "");
      formData.append("medical_history", recordForm.medical_history || "");
      if (recordForm.file) formData.append("file", recordForm.file);
      formData.append("updateBy", user.id);

      let res = await postMedicalRecord(formData);

      if (res && res.errCode === 0) {
        message.success("Lưu hồ sơ bệnh án thành công!");
        // setScreen("PATIENT_DETAIL");
        setScreen("LIST");

        await getDataPatient();
      } else {
        message.error(res?.errMessage || "Lưu hồ sơ bệnh án thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi lưu hồ sơ bệnh án:", error);
      message.error("Đã có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsShowLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    try {
      setIsShowLoading(true);
      let res = await deleteMedicalRecord(recordId);
      if (res && res.errCode === 0) {
        message.success("Xóa hồ sơ bệnh án thành công!");
        await getDataPatient(); // Gọi API để làm mới dữ liệu
        // Cập nhật selectedPatient nếu cần
        const updatedPatient = uniquePatients.find(
          (item) => item.id === selectedPatient?.id
        );
        if (updatedPatient) {
          setSelectedPatient(updatedPatient);
        }
        setScreen("LIST");
      } else {
        message.error(res?.errMessage || "Xóa hồ sơ bệnh án thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi xóa hồ sơ bệnh án:", error);
      message.error("Đã có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsShowLoading(false);
    }
  };

  // Xem chi tiết bệnh nhân và danh sách hồ sơ
  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setScreen("PATIENT_DETAIL");
  };

  // Xem hồ sơ cụ thể
  const handleViewRecord = (record, booking) => {
    setSelectedRecord(record);
    setSelectedBooking(booking);
    setScreen("VIEW");
  };

  // Sửa hồ sơ cụ thể
  const handleEditRecord = (record, booking) => {
    setRecordForm({
      id: record.id,
      description: record.description,
      height: selectedPatient?.patientProfile?.height || "",
      weight: selectedPatient?.patientProfile?.weight || "",
      underlying_diseases:
        selectedPatient?.patientProfile?.underlying_diseases || "",
      allergies: selectedPatient?.patientProfile?.allergies || "",
      medical_history: selectedPatient?.patientProfile?.medical_history || "",
      file: null,
    });
    setSelectedRecord(record);
    setSelectedBooking(booking);
    setScreen("EDIT");
  };

  // Tạo hồ sơ mới
  const handleCreateRecord = () => {
    setRecordForm({
      id: "",
      description: "",
      height: selectedPatient?.patientProfile?.height || "",
      weight: selectedPatient?.patientProfile?.weight || "",
      underlying_diseases:
        selectedPatient?.patientProfile?.underlying_diseases || "",
      allergies: selectedPatient?.patientProfile?.allergies || "",
      medical_history: selectedPatient?.patientProfile?.medical_history || "",
      file: null,
    });
    setSelectedRecord(null);
    setScreen("CREATE");
  };

  const bufferToBlobUrl = (bufferData, mimeType = "application/pdf") => {
    if (!bufferData) return null;
    const byteArray = new Uint8Array(bufferData);
    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
  };

  // console.log("selectedPatient", screen, selectedPatient);
  // console.log("selectedBooking", selectedBooking);
  // console.log("selectedRecord", selectedRecord);
  // console.log("recordForm", recordForm);

  const renderScreen = () => {
    switch (screen) {
      case "CREATE":
      case "EDIT":
        return (
          <div className="patient-detail-container vh-100 overflow-auto bg-white p-3 no-scrollbar">
            <span
              className="text-primary ms-2"
              style={{
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
              }}
              onClick={() => setScreen("PATIENT_DETAIL")}
            >
              <LeftOutlined style={{ marginRight: 6 }} /> Quay lại chi tiết bệnh
              nhân
            </span>
            <h2 className="mb-4 title">
              {screen === "EDIT"
                ? "Chỉnh sửa hồ sơ bệnh án"
                : "Tạo hồ sơ bệnh án mới"}
            </h2>
            {/* Thông tin bệnh nhân */}
            <Card type="inner" title="Thông tin bệnh nhân" className="mb-4">
              <Row gutter={[16, 8]}>
                <Col xs={24} sm={12}>
                  <p>
                    <b>Họ và tên:</b> {selectedPatient?.fullName}
                  </p>
                  <p>
                    <b>Giới tính:</b>{" "}
                    {language === LANGUAGES.VI
                      ? selectedPatient?.genderData?.valueVi
                      : selectedPatient?.genderData?.valueEn}
                  </p>
                  <p>
                    <b>Ngày sinh:</b>{" "}
                    {selectedPatient?.dateOfBirth
                      ? new Date(
                          selectedPatient.dateOfBirth
                        ).toLocaleDateString("vi-VN")
                      : ""}
                  </p>
                </Col>
                <Col xs={24} sm={12}>
                  <p>
                    <b>SĐT:</b> {selectedPatient?.phoneNumber}
                  </p>
                  <p>
                    <b>Địa chỉ:</b> {selectedPatient?.addressDetail},{" "}
                    {selectedPatient?.provinceData?.name}
                  </p>
                  <p>
                    <b>Thời gian:</b>{" "}
                    {selectedBooking?.date
                      ? moment(Number(selectedBooking.date)).format(
                          "DD/MM/YYYY"
                        )
                      : "-"}
                  </p>
                </Col>
              </Row>
            </Card>

            {/* Form nhập hồ sơ bệnh án */}
            <Card type="inner" title="Thông tin bệnh án">
              <Form
                layout="vertical"
                onFinish={handleSaveMedicalRecord}
                initialValues={recordForm}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Chiều cao (cm)" name="height">
                      <Input
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
                    <Form.Item label="Cân nặng (kg)" name="weight">
                      <Input
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
                    <Form.Item label="Bệnh nền" name="underlying_diseases">
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
                    <Form.Item label="Dị ứng" name="allergies">
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

                <Form.Item label="Lịch sử bệnh" name="medical_history">
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

                <Form.Item label="Kết luận khám bệnh" name="description">
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

                <Form.Item label="Tệp đính kèm (nếu có)" name="file">
                  <Upload
                    beforeUpload={(file) => {
                      setRecordForm({ ...recordForm, file });
                      return false; // không upload ngay
                    }}
                  >
                    <Button icon={<UploadOutlined />}>Chọn tệp</Button>
                  </Upload>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Lưu hồ sơ bệnh án
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        );
      case "VIEW":
        return (
          <div className="patient-detail-container vh-100 overflow-auto bg-light p-4 rounded-3 shadow-sm .no-scrollbar">
            <span
              className="text-primary d-inline-flex align-items-center"
              style={{ cursor: "pointer" }}
              onClick={() => setScreen("PATIENT_DETAIL")}
            >
              <LeftOutlined style={{ marginRight: 6 }} /> Quay lại chi tiết bệnh
              nhân
            </span>

            <h2 className="mb-4 title">Hồ sơ bệnh án chi tiết</h2>

            <Card
              title={<b className="text-primary">Thông tin bệnh nhân</b>}
              className="mb-4 border-0 shadow-sm rounded-4"
            >
              <div className="row">
                <div className="col-md-6 mb-2">
                  <b>Họ và tên:</b>{" "}
                  <b className="text-primary">{selectedPatient?.fullName}</b>
                </div>
                <div className="col-md-6 mb-2">
                  <b>Giới tính:</b> {selectedPatient?.genderData?.valueVi}
                </div>
                <div className="col-md-6 mb-2">
                  <b>Ngày sinh:</b> {formatDate(selectedPatient?.dateOfBirth)}
                </div>
                <div className="col-md-6 mb-2">
                  <b>CCCD:</b> {selectedPatient?.CCCD}
                </div>
                <div className="col-md-6 mb-2">
                  <b>Địa chỉ:</b> {selectedPatient?.addressDetail},{" "}
                  {selectedPatient?.provinceData?.name}
                </div>
                <div className="col-md-6 mb-2">
                  <b>Email:</b> {selectedPatient?.email}
                </div>
                <div className="col-md-6 mb-2">
                  <b>Số điện thoại:</b> {selectedPatient?.phoneNumber}
                </div>
              </div>
            </Card>

            <Card
              title={<b className="text-primary">Thông tin khám bệnh</b>}
              className="mb-4 border-0 shadow-sm rounded-4"
            >
              <div className="row">
                <div className="col-md-6 mb-2">
                  <b>Triệu chứng:</b> {selectedBooking?.symptoms}
                </div>
                <div className="col-md-6 mb-2">
                  <b>Ngày khám:</b> {formatDate(selectedBooking?.date)}
                </div>
                <div className="col-md-6 mb-2">
                  <b>Bác sĩ khám:</b> {user?.fullName}
                </div>
                <div className="col-md-6 mb-2">
                  <b>Giờ khám:</b>{" "}
                  {selectedBooking?.timeTypeDataPatient?.valueVi}
                </div>
              </div>
            </Card>

            <Card
              title={
                <b className="text-primary">Kết quả và thông tin sức khỏe</b>
              }
              className="border-0 shadow-sm rounded-4"
            >
              <div className="row">
                <div className="col-md-6 mb-2">
                  <b>Chiều cao:</b> {selectedPatient?.patientProfile?.height} m
                </div>
                <div className="col-md-6 mb-2">
                  <b>Cân nặng:</b> {selectedPatient?.patientProfile?.weight} kg
                </div>
                <div className="col-md-6 mb-2">
                  <b>Bệnh nền:</b>{" "}
                  {selectedPatient?.patientProfile?.underlying_diseases}
                </div>
                <div className="col-md-6 mb-2">
                  <b>Dị ứng:</b> {selectedPatient?.patientProfile?.allergies}
                </div>
                <div className="col-12 mb-2">
                  <b>Lịch sử bệnh:</b>{" "}
                  {selectedPatient?.patientProfile?.medical_history}
                </div>
                <div className="col-12 mb-2">
                  <b>Kết luận:</b>{" "}
                  <span className="text-danger">
                    {selectedRecord?.description || "Chưa có"}
                  </span>
                </div>
                <div className="col-12 mb-2">
                  <b>File PDF:</b>{" "}
                  {selectedRecord?.file?.data ? (
                    <div className="mt-2">
                      {(() => {
                        const fileData = selectedRecord.file.data;
                        const uint8Array = new Uint8Array(fileData);
                        const blob = new Blob([uint8Array], {
                          type: "application/pdf",
                        });
                        const pdfUrl = URL.createObjectURL(blob);
                        return (
                          <>
                            <iframe
                              src={pdfUrl}
                              width="100%"
                              height="500px"
                              title="Hồ sơ bệnh án PDF"
                              style={{
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                              }}
                            ></iframe>

                            <button
                              className="btn btn-sm btn-outline-primary mt-2"
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = pdfUrl;
                                link.download = "ho-so-benh-an.pdf";
                                link.click();
                              }}
                            >
                              Tải PDF
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <span className="text-muted">Chưa có file</span>
                  )}
                </div>
              </div>
            </Card>
          </div>
        );

      case "PATIENT_DETAIL":
        return (
          <div className="patient-detail-container vh-100 overflow-auto bg-light p-4 rounded-3 shadow-sm .no-scrollbar">
            <span
              className="text-primary d-inline-flex align-items-center"
              style={{ cursor: "pointer" }}
              onClick={() => setScreen("LIST")}
            >
              <LeftOutlined style={{ marginRight: 6 }} /> Quay lại danh sách
              bệnh nhân
            </span>

            <h2 className="mb-4 title">
              Chi tiết hồ sơ bệnh án của {selectedPatient?.fullName}
            </h2>

            <Card
              title={<b className="text-primary">Thông tin bệnh nhân</b>}
              className="mb-4 border-0 shadow-sm rounded-4"
            >
              <div className="row">
                <div className="col-md-6 mb-2">
                  <b>Họ và tên:</b>{" "}
                  <b className="text-primary">{selectedPatient?.fullName}</b>
                </div>
                <div className="col-md-6 mb-2">
                  <b>Giới tính:</b> {selectedPatient?.genderData?.valueVi}
                </div>
                <div className="col-md-6 mb-2">
                  <b>Ngày sinh:</b> {formatDate(selectedPatient?.dateOfBirth)}
                </div>
                <div className="col-md-6 mb-2">
                  <b>CCCD:</b> {selectedPatient?.CCCD}
                </div>
                <div className="col-md-6 mb-2">
                  <b>Địa chỉ:</b> {selectedPatient?.addressDetail},{" "}
                  {selectedPatient?.provinceData?.name}
                </div>
                <div className="col-md-6 mb-2">
                  <b>Email:</b> {selectedPatient?.email}
                </div>
                <div className="col-md-6 mb-2">
                  <b>Số điện thoại:</b> {selectedPatient?.phoneNumber}
                </div>
              </div>
            </Card>

            <Card
              title={
                <b className="text-primary">
                  Danh sách lịch hẹn và hồ sơ bệnh án
                </b>
              }
              className="mb-4 border-0 shadow-sm rounded-4"
            >
              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <th>STT</th>
                    <th>Ngày khám</th>
                    <th>Giờ khám</th>
                    <th>Triệu chứng</th>
                    <th>Kết luận</th>
                    <th>Actions</th>
                  </tr>
                  {selectedPatient?.bookings &&
                  selectedPatient.bookings.length > 0 ? (
                    selectedPatient.bookings
                      .sort((a, b) => Number(b.date) - Number(a.date))
                      .map((booking, index) => {
                        const record = selectedPatient.medicalRecords?.find(
                          (r) => r.bookingId === booking.id
                        );
                        return (
                          <tr key={booking.id}>
                            <td>{index + 1}</td>
                            <td>
                              {booking.date
                                ? moment(Number(booking.date)).format(
                                    "DD/MM/YYYY"
                                  )
                                : "-"}
                            </td>
                            <td>{booking.timeTypeDataPatient?.valueVi}</td>
                            <td>{booking.symptoms}</td>
                            <td>
                              {record
                                ? record.description?.slice(0, 50) +
                                  (record.description?.length > 50 ? "..." : "")
                                : "Chưa có"}
                            </td>
                            <td className="d-flex gap-2">
                              {record ? (
                                <>
                                  <EyeOutlined
                                    style={{ color: "blue", cursor: "pointer" }}
                                    onClick={() =>
                                      handleViewRecord(record, booking)
                                    }
                                  />
                                  <EditOutlined
                                    style={{
                                      color: "green",
                                      cursor: "pointer",
                                    }}
                                    onClick={() =>
                                      handleEditRecord(record, booking)
                                    }
                                  />
                                  <DeleteOutlined
                                    style={{ color: "red", cursor: "pointer" }}
                                    onClick={() =>
                                      Modal.confirm({
                                        title: "Xác nhận xóa",
                                        content:
                                          "Bạn có chắc chắn muốn xóa hồ sơ bệnh án này?",
                                        okText: "Xóa",
                                        okType: "danger",
                                        cancelText: "Hủy",
                                        onOk: () =>
                                          handleDeleteRecord(record.id),
                                      })
                                    }
                                  />
                                </>
                              ) : (
                                <Button
                                  icon={<PlusOutlined />}
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    handleCreateRecord();
                                  }}
                                >
                                  Tạo
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan="6">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        );

      case "LIST":
      default:
        return (
          <div className="manage-patient-container">
            <div className="m-p-title">Hồ sơ bệnh án</div>
            <div className="manage-patient-body row">
              <div className="d-flex gap-3 mb-3">
                {/* Chọn ngày */}
                <input
                  type="date"
                  className="form-control"
                  value={
                    filterDate ? moment(filterDate).format("YYYY-MM-DD") : ""
                  }
                  onChange={(e) =>
                    setFilterDate(
                      e.target.value ? new Date(e.target.value) : null
                    )
                  }
                />

                {/* Tìm tên */}
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm theo tên bệnh nhân..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>

              <div className="col-12 table-manage-patient">
                <table style={{ width: "100%" }}>
                  <tbody>
                    <tr>
                      <th>STT</th>
                      <th>Họ và tên</th>
                      <th>Giới tính</th>
                      <th>Địa chỉ</th>
                      <th>Hồ sơ bệnh án</th>
                      <th>Actions</th>
                    </tr>
                    {uniquePatients && uniquePatients.length > 0 ? (
                      uniquePatients
                        .filter((item) =>
                          searchName
                            ? item?.fullName
                                ?.toLowerCase()
                                .includes(searchName.toLowerCase())
                            : true
                        )
                        .map((item, index) => {
                          let gender =
                            language === LANGUAGES.VI
                              ? item?.genderData?.valueVi
                              : item?.genderData?.valueEn;

                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{item?.fullName}</td>
                              <td>{gender}</td>
                              <td>
                                {item?.addressDetail},{" "}
                                {item?.provinceData?.name}
                              </td>
                              <td>{item?.medicalRecords?.length || 0}</td>
                              <td>
                                <Button
                                  icon={<EyeOutlined />}
                                  onClick={() => handleViewPatient(item)}
                                >
                                  Quản lý hồ sơ
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td colSpan="6">Không có dữ liệu</td>
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
    <Spin style={{ zIndex: "1600" }} spinning={isShowLoading} tip="Loading...">
      {renderScreen()}
    </Spin>
  );
};

export default MedicalRecord;
