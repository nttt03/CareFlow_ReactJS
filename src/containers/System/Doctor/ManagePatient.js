import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import "./ManagePatient.scss";
import DatePicker from "../../../components/Input/DatePicker";
import {
  getAllPatientForDoctor,
  postSendRemedy,
  postMedicalRecord,
} from "../../../services/userService";
import moment from "moment";
import { LANGUAGES } from "../../../utils";
import RemedyModal from "./RemedyModal";
import { toast } from "react-toastify";
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
import { UploadOutlined, LeftOutlined } from "@ant-design/icons";

const ManagePatient = () => {
  const user = useSelector((state) => state.user.userInfo);
  const language = useSelector((state) => state.app.language);

  const [currentDate, setCurrentDate] = useState(
    moment(new Date()).startOf("day").valueOf()
  );
  const [dataPatient, setDataPatient] = useState([]);
  const [isOpenRemedyModal, setIsOpenRemedyModal] = useState(false);
  const [dataModal, setDataModal] = useState({});
  const [isShowLoading, setIsShowLoading] = useState(false);
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

  const handleSaveMedicalRecord = async () => {
    const formData = new FormData();
    formData.append("patientId", selectedPatient?.patientId);
    formData.append("doctorId", user?.id);
    formData.append("bookingId", selectedPatient?.id); // nếu có id lịch khám
    formData.append("description", recordForm.description);
    formData.append("height", recordForm.height);
    formData.append("weight", recordForm.weight);
    formData.append("underlying_diseases", recordForm.underlying_diseases);
    formData.append("allergies", recordForm.allergies);
    formData.append("medical_history", recordForm.medical_history);
    if (recordForm.file) formData.append("file", recordForm.file);
    formData.append("updateBy", user?.id);
    let res = await postMedicalRecord(formData);

    if (res && res.errCode === 0) {
      message.success("Lưu hồ sơ bệnh án thành công!");
      setScreen("LIST");
    } else {
      message.error("Lưu hồ sơ bệnh án thất bại!");
    }
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
  console.log("currentDate", currentDate);
  const handleBtnConfirm = (item) => {
    let data = {
      doctorId: item.doctorId,
      patientId: item.patientId,
      email: item.patientData.email,
      timeType: item.timeType,
      patientName: item.patientData.fullName,
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
      language: language,
    });
    if (res && res.errCode === 0) {
      setIsShowLoading(false);
      toast.success("Gửi đơn thuốc thành công!");
      closeRemedyModal();
      await getDataPatient();
    } else {
      setIsShowLoading(false);
      toast.error("Gửi đơn thuốc thất bại!");
      console.error("Lỗi gửi đơn thuốc:", res);
    }
  };

  const handleCreateMedicalRecord = (item) => {
    setSelectedPatient(item);
    // lấy patientProfile để fill vào form
    setRecordForm({
      description: "",
      height: item?.patientData?.patientProfile?.height || "",
      weight: item?.patientData?.patientProfile?.weight || "",
      underlying_diseases:
        item?.patientData?.patientProfile?.underlying_diseases || "",
      allergies: item?.patientData?.patientProfile?.allergies || "",
      medical_history: item?.patientData?.patientProfile?.medical_history || "",
      file: null,
    });
    setScreen("CREATE");
  };

  const renderScreen = () => {
    switch (screen) {
      case "CREATE":
        return (
          <div className="patient-detail-container vh-100 overflow-auto bg-white p-3 no-scrollbar">
            <span
              className="text-primary ms-2"
              style={{
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
              }}
              onClick={() => setScreen("LIST")}
            >
              <LeftOutlined style={{ marginRight: 6 }} /> Quay lại danh sách
            </span>
            <h2 className="mb-4 title">Khám lập hồ sơ bệnh án</h2>
            {/* Thông tin bệnh nhân */}
            <Card type="inner" title="Thông tin bệnh nhân" className="mb-4">
              <Row gutter={[16, 8]}>
                <Col xs={24} sm={12}>
                  <p>
                    <b>Họ và tên:</b> {selectedPatient?.patientData?.fullName}
                  </p>
                  <p>
                    <b>Giới tính:</b>{" "}
                    {language === LANGUAGES.VI
                      ? selectedPatient?.patientData?.genderData?.valueVi
                      : selectedPatient?.patientData?.genderData?.valueEn}
                  </p>
                  <p>
                    <b>Ngày sinh:</b>{" "}
                    {selectedPatient?.patientData?.dateOfBirth}
                  </p>
                </Col>
                <Col xs={24} sm={12}>
                  <p>
                    <b>SĐT:</b> {selectedPatient?.patientData?.phoneNumber}
                  </p>
                  <p>
                    <b>Địa chỉ:</b>{" "}
                    {selectedPatient?.patientData?.addressDetail},{" "}
                    {selectedPatient?.patientData?.provinceData?.name}
                  </p>
                  <p>
                    <b>Thời gian:</b>{" "}
                    {selectedPatient?.date
                      ? moment(Number(selectedPatient.date)).format(
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

      case "LIST":
      default:
        return (
          <div className="manage-patient-container">
            <div className="m-p-title">Quản lý bệnh nhân khám bệnh</div>
            <div className="manage-patient-body row">
              <div className="col-4 form-group mb-3">
                <label className="form-label">Chọn ngày khám</label>
                <DatePicker
                  className="form-control"
                  onChange={handleOnChangeDatePicker}
                  value={currentDate}
                />
              </div>
              <div className="col-12 table-manage-patient">
                <table style={{ width: "100%" }}>
                  <tbody>
                    <tr>
                      <th>STT</th>
                      <th>Thời gian khám</th>
                      <th>Họ và tên</th>
                      <th>Giới tính</th>
                      <th>Địa chỉ</th>
                      <th>Actions</th>
                    </tr>
                    {dataPatient && dataPatient.length > 0 ? (
                      dataPatient.map((item, index) => {
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
                              {item?.patientData?.addressDetail}
                              {", "}
                              {item?.patientData?.provinceData?.name}
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-success"
                                  onClick={() => handleBtnConfirm(item)}
                                >
                                  <i className="bi bi-check-circle me-1"></i>{" "}
                                  Xác nhận
                                </button>
                                <button
                                  className="btn btn-primary"
                                  onClick={() => {
                                    handleCreateMedicalRecord(item);
                                  }}
                                >
                                  <i className="bi bi-file-earmark-medical me-1"></i>{" "}
                                  Lập hồ sơ
                                </button>
                              </div>
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
    <>
      <Spin
        style={{ zIndex: "1600" }}
        spinning={isShowLoading}
        tip="Loading..."
      >
        {renderScreen()}

        <RemedyModal
          isOpenModal={isOpenRemedyModal}
          dataModal={dataModal}
          closeRemedyModal={closeRemedyModal}
          sendRemedy={sendRemedy}
        />
      </Spin>
    </>
  );
};

export default ManagePatient;
