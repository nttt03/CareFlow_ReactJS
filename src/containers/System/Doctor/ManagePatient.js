import React, { Component } from "react";
import { connect } from "react-redux";
import "./ManagePatient.scss";
import DatePicker from "../../../components/Input/DatePicker";
import {
  getAllPatientForDoctor,
  postSendRemedy,
} from "../../../services/userService";
import moment from "moment";
import { LANGUAGES } from "../../../utils";
import RemedyModal from "./RemedyModal";
import { toast } from "react-toastify";
import { Spin } from "antd";

class ManagePatient extends Component {
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
    let res = await getAllPatientForDoctor({
      doctorId: user.id,
      date: formatedDate,
    });
    if (res && res.errCode === 0) {
      this.setState({ dataPatient: res.data });
    }
  };

  handleOnChangeDatePicker = (data) => {
    this.setState(
      {
        currentDate: data[0],
      },
      async () => {
        await this.getDataPatient();
      }
    );
  };

  handleBtnConfirm = (item) => {
    let data = {
      doctorId: item.doctorId,
      patientId: item.patientId,
      email: item.patientData.email,
      timeType: item.timeType,
      patientName: item.patientData.firstName,
    };
    this.setState({
      isOpenRemedyModal: true,
      dataModal: data,
    });
  };

  closeRemedyModal = () => {
    this.setState({
      isOpenRemedyModal: false,
      dataModal: {},
    });
  };

  sendRemedy = async (dataChild) => {
    let { dataModal } = this.state;
    this.setState({ isShowLoading: true });

    let res = await postSendRemedy({
      email: dataChild.email,
      imgBase64: dataChild.imgBase64,
      doctorId: dataModal.doctorId,
      patientId: dataModal.patientId,
      timeType: dataModal.timeType,
      patientName: dataModal.patientName,
      language: this.props.language,
    });
    if (res && res.errCode === 0) {
      this.setState({ isShowLoading: false });
      toast.success("Gửi đơn thuốc thành công!");
      this.closeRemedyModal();
      await this.getDataPatient();
    } else {
      this.setState({ isShowLoading: false });
      toast.error("Gửi đơn thuốc thất bại!");
      console.log("Lỗi gửi đơn thuốc:", res);
    }
  };

  render() {
    let { dataPatient, isOpenRemedyModal, dataModal, isShowLoading } =
      this.state;
    let { language } = this.props;
    return (
      <Spin spinning={isShowLoading} tip="Loading...">
        <div className="manage-patient-container">
          <div className="m-p-title">Quản lý bệnh nhân khám bệnh</div>
          <div className="manage-patient-body row">
            <div className="col-4 form-group">
              <label className="form-label">Chọn ngày khám</label>
              <DatePicker
                className="form-control"
                onChange={this.handleOnChangeDatePicker}
                value={this.state.currentDate}
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
                          ? item.patientData.genderData.valueVi
                          : item.patientData.genderData.valueEn;
                      let time =
                        language === LANGUAGES.VI
                          ? item.timeTypeDataPatient.valueVi
                          : item.timeTypeDataPatient.valueEn;
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{time}</td>
                          <td>{item.patientData.firstName}</td>
                          <td>{gender}</td>
                          <td>{item.patientData.address}</td>
                          <td>
                            <button
                              className="mp-btn-confirm"
                              onClick={() => this.handleBtnConfirm(item)}
                            >
                              Xác nhận
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

export default connect(mapStateToProps)(ManagePatient);
