import React, { Component } from "react";
import { connect } from "react-redux";
import "./ManagePatient.scss";
import {
  getWaitingApprovalForDoctor,
  updateBookingStatus,
} from "../../../services/userService";
import moment from "moment";
import { LANGUAGES } from "../../../utils";
import RemedyModal from "./RemedyModal";
import { toast } from "react-toastify";
import { Spin } from "antd";

class WaitingApproval extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDate: moment(new Date()).startOf("day").valueOf(),
      dataPatient: [],
      isOpenRemedyModal: false,
      dataModal: {},
      isShowLoading: false,
    };
  }

  async componentDidMount() {
    this.getDataPatient();
  }

  getDataPatient = async () => {
    let { user } = this.props;
    let { currentDate } = this.state;
    let formatedDate = new Date(currentDate).getTime();
    let res = await getWaitingApprovalForDoctor({
      doctorId: user.id,
      // date: formatedDate,
      status: "S1",
    });
    if (res && res.errCode === 0) {
      this.setState({ dataPatient: res.data });
    }
  };

  handleConfirm = async (item) => {
    let res = await updateBookingStatus({
      bookingId: item.id,
      status: "S2",
    });

    if (res && res.errCode === 0) {
      toast.success("Xác nhận lịch thành công!");
      await this.getDataPatient();
    } else {
      toast.error("Xác nhận thất bại!");
    }
  };

  handleCancel = async (item) => {
    let res = await updateBookingStatus({
      bookingId: item.id,
      status: "S5",
    });

    if (res && res.errCode === 0) {
      toast.success("Hủy lịch thành công!");
      await this.getDataPatient();
    } else {
      toast.error("Hủy lịch thất bại!");
    }
  };

  render() {
    let { dataPatient, isOpenRemedyModal, dataModal, isShowLoading } =
      this.state;
    let { language } = this.props;
    return (
      <Spin spinning={isShowLoading} tip="Loading...">
        <div className="manage-patient-container">
          <div className="m-p-title py-2">Quản lý lịch hẹn</div>
          <div className="manage-patient-body row">
            <div className="col-12 table-manage-patient">
              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <th>STT</th>
                    <th>Ngày khám</th>
                    <th>Thời gian khám</th>
                    <th>Họ và tên</th>
                    <th>Giới tính</th>
                    <th>Địa chỉ</th>
                    <th>Triệu chứng</th>
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
                              Xác nhận
                            </button>
                            <button
                              className="mp-btn-cancel"
                              onClick={() => this.handleCancel(item)}
                            >
                              Hủy lịch
                            </button>
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
        <RemedyModal
          isOpenModal={isOpenRemedyModal}
          dataModal={dataModal}
          closeRemedyModal={this.closeRemedyModal}
          sendRemedy={this.sendRemedy}
        />
      </Spin>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
  user: state.user.userInfo,
});

export default connect(mapStateToProps)(WaitingApproval);
