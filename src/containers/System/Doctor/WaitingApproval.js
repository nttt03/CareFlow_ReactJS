import React, { Component } from "react";
import { connect } from "react-redux";
import "./ManagePatient.scss";
import {
  getWaitingApprovalForAdmin,
  getWaitingApprovalForDoctor,
  updateBookingStatus,
} from "../../../services/userService";
import moment from "moment";
import { LANGUAGES } from "../../../utils";
import RemedyModal from "./RemedyModal";
import { toast } from "react-toastify";
import { Spin, Modal, Input, Form } from "antd";

class WaitingApproval extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDate: moment(new Date()).startOf("day").valueOf(),
      dataPatient: [],
      isOpenRemedyModal: false,
      dataModal: {},
      isShowLoading: false,
      isOpenCancelModal: false,
      cancelBookingId: null,
      cancelReason: "",
      isSubmitting: false,
    };
  }

  handleOpenCancelModal = (item) => {
    this.setState({
      isOpenCancelModal: true,
      cancelBookingId: item.id,
      cancelReason: "",
    });
  };

  handleCloseCancelModal = () => {
    this.setState({
      isOpenCancelModal: false,
      cancelBookingId: null,
      cancelReason: "",
    });
  };

  async componentDidMount() {
    this.getDataPatient();
  }

  getDataPatient = async () => {
    let { user } = this.props;
    console.log("user: ", user);
    let { currentDate } = this.state;
    let formatedDate = new Date(currentDate).getTime();
    if (user.roleId === "R1") {
      let res = await getWaitingApprovalForAdmin({
        status: "S1",
      });
      if (res && res.errCode === 0) {
        this.setState({ dataPatient: res.data });
      }
    }
    if (user.roleId === "R2") {
      let res = await getWaitingApprovalForDoctor({
        doctorId: user.id,
        // date: formatedDate,
        status: "S1",
      });
      if (res && res.errCode === 0) {
        this.setState({ dataPatient: res.data });
      }
    }
  };

  handleConfirm = async (item) => {
    const { language } = this.props;
    let res = await updateBookingStatus({
      bookingId: item.id,
      status: "S2",
    });

    if (res && res.errCode === 0) {
      toast.success(
        language === "vi"
          ? "Xác nhận lịch thành công!"
          : "Appointment confirmed successfully!"
      );
      await this.getDataPatient();
    } else {
      toast.error(
        language === "vi" ? "Xác nhận thất bại!" : "Confirmation failed!"
      );
    }
  };

  handleCancel = (item) => {
    this.handleOpenCancelModal(item);
  };

  handleSubmitCancel = async () => {
    const { cancelBookingId, cancelReason } = this.state;
    const { language } = this.props;

    if (!cancelReason.trim()) {
      toast.error(
        language === "vi"
          ? "Vui lòng nhập lý do hủy!"
          : "Please enter cancel reason!"
      );
      return;
    }

    this.setState({ isSubmitting: true });

    try {
      let res = await updateBookingStatus({
        bookingId: cancelBookingId,
        status: "S5",
        rejectReason: cancelReason.trim(),
      });

      if (res && res.errCode === 0) {
        toast.success(
          language === "vi"
            ? "Hủy lịch thành công!"
            : "Appointment cancelled successfully!"
        );
        this.handleCloseCancelModal();
        await this.getDataPatient();
      } else {
        toast.error(
          res.errMessage ||
            (language === "vi" ? "Hủy thất bại!" : "Cancellation failed!")
        );
      }
    } catch (error) {
      toast.error(language === "vi" ? "Lỗi hệ thống!" : "System error!");
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  render() {
    let {
      dataPatient,
      isOpenRemedyModal,
      dataModal,
      isShowLoading,
      isOpenCancelModal,
    } = this.state;
    let { language } = this.props;
    return (
      <Spin spinning={isShowLoading} tip="Loading...">
        <div className="manage-patient-container">
          <div className="m-p-title py-2">
            {language === "vi"
              ? "Lịch hẹn chờ duyệt"
              : "Appointment schedule pending approval"}
          </div>
          <div className="manage-patient-body row">
            <div className="col-12 table-manage-patient">
              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <th>{language === "vi" ? "STT" : "No."}</th>
                    <th>
                      {language === "vi" ? "Ngày khám" : "Examination Date"}
                    </th>
                    <th>
                      {language === "vi"
                        ? "Thời gian khám"
                        : "Examination Time"}
                    </th>
                    <th>{language === "vi" ? "Họ và tên" : "Full Name"}</th>
                    <th>{language === "vi" ? "Giới tính" : "Gender"}</th>
                    <th>{language === "vi" ? "Địa chỉ" : "Address"}</th>
                    <th>{language === "vi" ? "Triệu chứng" : "Symptoms"}</th>
                    <th>{language === "vi" ? "Thao tác" : "Actions"}</th>
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
                      let formatDate = moment(+item.date).format("DD/MM/YYYY");
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{formatDate}</td>
                          <td>{time}</td>
                          <td>{item?.patientData?.fullName}</td>
                          <td>{gender}</td>
                          <td>
                            {item?.patientData?.addressDetail}
                            {", "}
                            {item?.patientData?.provinceData?.name}
                          </td>
                          <td>{item?.symptoms}</td>
                          <td>
                            <button
                              className="mp-btn-confirm"
                              onClick={() => this.handleConfirm(item)}
                            >
                              {language === "vi" ? "Xác nhận" : "Approve"}
                            </button>

                            <button
                              className="mp-btn-cancel"
                              onClick={() => this.handleCancel(item)}
                            >
                              {language === "vi" ? "Hủy lịch" : "Cancel"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <td colSpan="6">
                      {language === "vi"
                        ? "Không có dữ liệu"
                        : "No data available"}
                    </td>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <RemedyModal
          isOpenModal={isOpenRemedyModal}
          dataModal={dataModal}
          closeRemedyModal={this.closeRemedyModal}
          sendRemedy={this.sendRemedy}
        />
        <Modal
          title={
            <span style={{ color: "#d4380d" }}>
              {language === "vi"
                ? "Xác nhận hủy lịch hẹn"
                : "Confirm Appointment Cancellation"}
            </span>
          }
          open={isOpenCancelModal}
          onCancel={this.handleCloseCancelModal}
          footer={null}
          width={500}
          centered
        >
          <Form layout="vertical">
            <Form.Item
              label={
                language === "vi" ? "Lý do hủy lịch" : "Cancellation Reason"
              }
              required
              tooltip={language === "vi" ? "Bắt buộc nhập" : "Required"}
            >
              <Input.TextArea
                rows={4}
                placeholder={
                  language === "vi"
                    ? "Ví dụ: Bệnh nhân không đến, lịch trùng, yêu cầu hủy..."
                    : "E.g., Patient no-show, schedule conflict, patient request..."
                }
                value={this.state.cancelReason}
                onChange={(e) =>
                  this.setState({ cancelReason: e.target.value })
                }
                disabled={this.state.isSubmitting}
              />
            </Form.Item>

            <div className="text-right">
              <button
                className="mp-btn-cancel"
                onClick={this.handleCloseCancelModal}
                disabled={this.state.isSubmitting}
                style={{ marginRight: 8 }}
              >
                {language === "vi" ? "Đóng" : "Close"}
              </button>
              <button
                className="mp-btn-confirm"
                onClick={this.handleSubmitCancel}
                disabled={
                  this.state.isSubmitting || !this.state.cancelReason.trim()
                }
                style={{
                  background: "#d4380d",
                  borderColor: "#d4380d",
                  opacity:
                    this.state.isSubmitting || !this.state.cancelReason.trim()
                      ? 0.6
                      : 1,
                }}
              >
                {this.state.isSubmitting ? (
                  <Spin size="small" />
                ) : language === "vi" ? (
                  "Xác nhận hủy"
                ) : (
                  "Confirm Cancel"
                )}
              </button>
            </div>
          </Form>
        </Modal>
      </Spin>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
  user: state.user.userInfo,
});

export default connect(mapStateToProps)(WaitingApproval);
