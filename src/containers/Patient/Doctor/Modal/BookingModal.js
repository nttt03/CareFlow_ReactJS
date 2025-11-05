import React, { Component } from "react";
import { connect } from "react-redux";
import "./BookingModal.scss";
import { LANGUAGES } from "../../../../utils";
import { FormattedMessage } from "react-intl";
import ProfileDoctor from "../ProfileDoctor";
import _ from "lodash";
import DatePicker from "../../../../components/Input/DatePicker";
import * as actions from "../../../../store/actions";
import { postPatientBookingAppointment } from "../../../../services/userService";
import moment from "moment";
import { Spin, Alert } from "antd";
import { Modal } from "reactstrap";
import { message } from "antd";

class BookingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fullName: "",
      phoneNumber: "",
      email: "",
      address: "",
      symptoms: "",
      birthday: "",
      selectedGender: "",
      genders: "",
      doctorId: "",
      timeType: "",
      isShowLoading: false,
    };
  }

  async componentDidMount() {
    this.props.getGenders();
    this.fillUserInfo(); // Điền thông tin khi component mount
  }

  async componentDidUpdate(prevProps) {
    if (this.props.genders !== prevProps.genders) {
      this.setState({
        genders: this.buildDataGender(this.props.genders),
      });
    }
    if (this.props.language !== prevProps.language) {
      this.setState({
        genders: this.buildDataGender(this.props.genders),
      });
    }
    if (this.props.dataTime !== prevProps.dataTime) {
      if (this.props.dataTime && !_.isEmpty(this.props.dataTime)) {
        this.setState({
          doctorId: this.props.dataTime.doctorId,
          timeType: this.props.dataTime.timeType,
        });
      }
    }
    // Điền thông tin khi userInfo thay đổi
    if (this.props.userInfo !== prevProps.userInfo) {
      this.fillUserInfo();
    }
  }

  buildDataGender = (data) => {
    let result = [];
    let language = this.props.language;
    if (data && data.length > 0) {
      data.map((item) => {
        let object = {};
        object.value = item.keyMap;
        object.label = language === LANGUAGES.VI ? item.valueVi : item.valueEn;
        result.push(object);
      });
    }
    return result;
  };

  fillUserInfo = () => {
    const { userInfo } = this.props;
    if (userInfo) {
      this.setState({
        fullName: userInfo.fullName || "",
        phoneNumber: userInfo.phoneNumber || "",
        email: userInfo.email || "",
        address: userInfo.addressDetail || "", // Sử dụng addressDetail làm address
        birthday: userInfo.dateOfBirth
          ? moment(userInfo.dateOfBirth).toDate()
          : "", // Chuyển thành định dạng Date cho DatePicker
        // Gender không có trong userInfo, để trống hoặc suy ra từ tên (tạm thời để trống)
        selectedGender: this.state.selectedGender || "", // Giữ giá trị hiện tại hoặc để trống
      });
    }
  };

  handleOnchangeInput = (event, id) => {
    this.setState({ [id]: event.target.value });
  };

  handleOnChangeDatePicker = (data) => {
    this.setState({ birthday: data[0] });
  };

  handleOnchangeSelect = (selectedOption) => {
    this.setState({ selectedGender: selectedOption });
  };

  buildDoctorName = (dataTime) => {
    let { language } = this.props;
    if (dataTime && !_.isEmpty(dataTime)) {
      return language === LANGUAGES.VI
        ? `${dataTime.doctorData.lastName} ${dataTime.doctorData.firstName}`
        : `${dataTime.doctorData.firstName} ${dataTime.doctorData.lastName}`;
    }
    return "";
  };

  buildTimeBooking = (dataTime) => {
    let { language } = this.props;
    if (dataTime && !_.isEmpty(dataTime)) {
      let time =
        language === LANGUAGES.VI
          ? dataTime.timeTypeData.valueVi
          : dataTime.timeTypeData.valueEn;
      let date =
        language === LANGUAGES.VI
          ? moment.unix(+dataTime.date / 1000).format("dddd - DD/MM/YYYY")
          : moment
              .unix(+dataTime.date / 1000)
              .locale("en")
              .format("ddd - MM/DD/YYYY");
      return `${time} - ${date}`;
    }
    return "";
  };

  handleConfirmBooking = async () => {
    const { language, userInfo } = this.props;
    if (!userInfo) {
      message.warning(
        language === "vi"
          ? "Vui lòng đăng nhập để sử dụng chức năng này"
          : "Please login to use this function"
      );
      return;
    }
    const { fullName, phoneNumber, email, birthday, symptoms } = this.state;
    if (!fullName || !phoneNumber || !email || !birthday || !symptoms) {
      message.warning(
        language === "vi"
          ? "Vui lòng nhập đầy đủ thông tin trước khi đặt lịch!"
          : "Please fill in all information before making an appointment!"
      );
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      message.error(
        language === "vi" ? "Email không hợp lệ!" : "Invalid email!"
      );
      return;
    }
    const phoneRegex = /^[0-9]{9,11}$/;
    if (!phoneRegex.test(phoneNumber)) {
      message.error(
        language === "vi"
          ? "Số điện thoại không hợp lệ!"
          : "Invalid phone number!"
      );
      return;
    }

    this.setState({ isShowLoading: true });

    let date = new Date(this.state.birthday).getTime();
    let timeString = this.buildTimeBooking(this.props.dataTime);
    let doctorName = this.buildDoctorName(this.props.dataTime);

    let res = await postPatientBookingAppointment({
      fullName: this.state.fullName,
      phoneNumber: this.state.phoneNumber,
      email: this.state.email,
      address: this.state.address,
      symptoms: this.state.symptoms,
      date: this.props.dataTime.date,
      birthday: date,
      selectedGender: this.state.selectedGender.value,
      doctorId: this.state.doctorId,
      timeType: this.state.timeType,
      language: this.props.language,
      timeString: timeString,
      doctorName: this.props.dataTime.doctorData.fullName,
      hospitalId: this.props.hospitalId || userInfo?.hospitalId,
    });

    this.setState({ isShowLoading: false });

    if (res && res.errCode === 0) {
      message.success(
        language === "vi"
          ? "Đặt lịch hẹn thành công"
          : "Booking a new appointment succeed"
      );
      this.props.closeBookingModal();
    } else {
      message.error(
        language === "vi"
          ? "Đặt lịch hẹn không thành công. Vui lòng thử lại!"
          : "Booking a new appointment error!"
      );
    }
  };

  render() {
    let {
      language,
      isOpenModal,
      closeBookingModal,
      dataTime,
      hospitalId,
      userInfo,
    } = this.props;
    let doctorId = dataTime && !_.isEmpty(dataTime) ? dataTime.doctorId : "";
    // console.log("userInfo", userInfo);

    return (
      <Spin spinning={this.state.isShowLoading} tip="Loading...">
        <Modal
          isOpen={isOpenModal}
          className="booking-modal-container"
          size="xl"
          centered
          toggle={closeBookingModal}
        >
          <div className="booking-modal-content">
            <div className="booking-modal-header">
              <span className="left">
                <FormattedMessage id="patient.booking-modal.title" />
              </span>
              <span className="right" onClick={closeBookingModal}>
                <i className="fas fa-times"></i>
              </span>
            </div>
            <div className="booking-modal-body">
              <div className="row">
                {/* Cột trái: Thông tin bác sĩ */}
                <div className="col-md-6 doctor-info">
                  <div className="card">
                    <div className="card-body">
                      <ProfileDoctor
                        doctorId={doctorId}
                        isShowDescriptionDoctor={false}
                        dataTime={dataTime}
                        isShowLinkDetail={false}
                        isShowPrice={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Cột phải: Form thông tin */}
                <div className="col-md-6 booking-form">
                  <div className="card h-100">
                    <Alert
                      message={
                        language === "vi"
                          ? "Vui lòng nhập đúng thông tin và email để nhận được thông báo nhắc nhở"
                          : "Please enter correct information and email to receive reminder notification"
                      }
                      type="warning"
                      showIcon
                    />
                    <div className="card-body">
                      <div className="row">
                        <div className="col-12 form-group mb-3">
                          <label>
                            <FormattedMessage id="patient.booking-modal.fullName" />
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={this.state.fullName}
                            onChange={(e) =>
                              this.handleOnchangeInput(e, "fullName")
                            }
                          />
                        </div>
                        <div className="col-12 form-group mb-3">
                          <label>
                            <FormattedMessage id="patient.booking-modal.phoneNumber" />
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            value={this.state.phoneNumber}
                            onChange={(e) =>
                              this.handleOnchangeInput(e, "phoneNumber")
                            }
                          />
                        </div>
                        <div className="col-12 form-group mb-3">
                          <label>
                            <FormattedMessage id="patient.booking-modal.email" />
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={this.state.email}
                            onChange={(e) =>
                              this.handleOnchangeInput(e, "email")
                            }
                          />
                        </div>
                        {/* <div className="col-12 form-group mb-3">
                          <label>
                            <FormattedMessage id="patient.booking-modal.address" />
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={this.state.address}
                            onChange={(e) =>
                              this.handleOnchangeInput(e, "address")
                            }
                          />
                        </div> */}
                        <div className="col-12 form-group mb-3">
                          <label>
                            <FormattedMessage id="patient.booking-modal.birthday" />
                          </label>
                          <DatePicker
                            className="form-control"
                            onChange={this.handleOnChangeDatePicker}
                            value={this.state.birthday}
                            placeholder="Select your birthday"
                          />
                        </div>
                        {/* <div className="col-12 form-group mb-3">
                          <label>
                            <FormattedMessage id="patient.booking-modal.gender" />
                          </label>
                          <Select
                            className="basic-single"
                            classNamePrefix="select"
                            placeholder={
                              <FormattedMessage id="patient.booking-modal.placeholder" />
                            }
                            value={this.state.selectedGender}
                            onChange={this.handleOnchangeSelect}
                            options={this.state.genders}
                          />
                        </div> */}
                        <div className="col-12 form-group mb-3">
                          <label>
                            <FormattedMessage id="patient.booking-modal.symptoms" />
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={this.state.symptoms}
                            onChange={(e) =>
                              this.handleOnchangeInput(e, "symptoms")
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="card-footer text-end">
                      <button
                        className="btn btn-success me-2"
                        onClick={() => this.handleConfirmBooking()}
                      >
                        <FormattedMessage id="patient.booking-modal.confirm" />
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={closeBookingModal}
                      >
                        <FormattedMessage id="patient.booking-modal.cancel" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </Spin>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
  genders: state.admin.genders,
  userInfo: state.user.userInfo,
});

const mapDispatchToProps = (dispatch) => ({
  getGenders: () => dispatch(actions.fetchGenderStart()),
});

export default connect(mapStateToProps, mapDispatchToProps)(BookingModal);
