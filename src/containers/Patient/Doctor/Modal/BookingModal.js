import React, { Component } from "react";
import { connect } from "react-redux";
import "./BookingModal.scss";
import { LANGUAGES } from "../../../../utils";
import { FormattedMessage } from "react-intl";
import { Modal } from "reactstrap";
import ProfileDoctor from "../ProfileDoctor";
import _ from "lodash";
import DatePicker from "../../../../components/Input/DatePicker";
import * as actions from "../../../../store/actions";
import Select from "react-select";
import { postPatientBookingAppointment } from "../../../../services/userService";
import { toast } from "react-toastify";
import moment from "moment";
import { Spin } from "antd";

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
  }

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
      hospitalId: this.props.hospitalId,
    });

    this.setState({ isShowLoading: false });

    if (res && res.errCode === 0) {
      toast.success("Booking a new appointment succeed");
      this.props.closeBookingModal();
    } else {
      toast.error("Booking a new appointment error!");
    }
  };

  render() {
    let { isOpenModal, closeBookingModal, dataTime } = this.props;
    let doctorId = dataTime && !_.isEmpty(dataTime) ? dataTime.doctorId : "";

    return (
      <Spin spinning={this.state.isShowLoading} tip="Loading...">
        {" "}
        {/* ✅ dùng Spin */}
        <Modal
          isOpen={isOpenModal}
          className={"booking-modal-container"}
          size="lg"
          centered
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
              <div className="doctor-infor">
                <ProfileDoctor
                  doctorId={doctorId}
                  isShowDescriptionDoctor={false}
                  dataTime={dataTime}
                  isShowLinkDetail={false}
                  isShowPrice={true}
                />
              </div>
              <div className="row">
                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.fullName" />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={this.state.fullName}
                    onChange={(e) => this.handleOnchangeInput(e, "fullName")}
                  />
                </div>
                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.phoneNumber" />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={this.state.phoneNumber}
                    onChange={(e) => this.handleOnchangeInput(e, "phoneNumber")}
                  />
                </div>
                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.email" />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={this.state.email}
                    onChange={(e) => this.handleOnchangeInput(e, "email")}
                  />
                </div>
                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.address" />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={this.state.address}
                    onChange={(e) => this.handleOnchangeInput(e, "address")}
                  />
                </div>
                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.birthday" />
                  </label>
                  <DatePicker
                    className="form-control"
                    onChange={this.handleOnChangeDatePicker}
                    value={this.state.birthday}
                  />
                </div>
                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.gender" />
                  </label>
                  <Select
                    placeholder={
                      <FormattedMessage id="patient.booking-modal.placeholder" />
                    }
                    value={this.state.selectedGender}
                    onChange={this.handleOnchangeSelect}
                    options={this.state.genders}
                  />
                </div>
                <div className="col-12 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.symptoms" />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={this.state.symptoms}
                    onChange={(e) => this.handleOnchangeInput(e, "symptoms")}
                  />
                </div>
              </div>
            </div>
            <div className="booking-modal-footer">
              <button
                className="btn btn-primary btn-booking-confirm"
                onClick={() => this.handleConfirmBooking()}
              >
                <FormattedMessage id="patient.booking-modal.confirm" />
              </button>
              <button
                className="btn btn-secondary btn-booking-cancel"
                onClick={closeBookingModal}
              >
                <FormattedMessage id="patient.booking-modal.cancel" />
              </button>
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
});

const mapDispatchToProps = (dispatch) => ({
  getGenders: () => dispatch(actions.fetchGenderStart()),
});

export default connect(mapStateToProps, mapDispatchToProps)(BookingModal);
