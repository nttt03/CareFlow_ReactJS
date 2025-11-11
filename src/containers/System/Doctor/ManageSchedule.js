import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import "./ManageSchedule.scss";
import { FormattedMessage } from "react-intl";
import * as actions from "../../../store/actions";
import Select from "react-select";
import { CRUD_ACTIONS, LANGUAGES, dateFormat } from "../../../utils";
import DatePicker from "../../../components/Input/DatePicker";
import moment from "moment";
import { toast } from "react-toastify";
import _ from "lodash";
import { saveBulkScheduleDoctor } from "../../../services/userService";
import { message } from "antd";

class ManageSchedule extends Component {
  constructor(props) {
    super(props);

    this.state = {
      listDoctors: [],
      selectedDoctor: {},
      currentDate: "",
      rangeTime: [],
      maxNumber: 10,
    };
  }

  componentDidMount() {
    this.props.fetchAllDoctorsRedux();
    this.props.fetchAllScheduleTime();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { userInfo } = this.props;

    if (prevProps.allDoctors !== this.props.allDoctors) {
      let doctors = this.props.allDoctors;

      // Nếu là role R4 (quản lý bệnh viện) → lọc bác sĩ theo hospitalId
      if (userInfo && userInfo.roleId === "R4" && userInfo.hospitalId) {
        doctors = doctors.filter(
          (doctor) => doctor.hospitalId === userInfo.hospitalId
        );
      }

      let dataSelect = this.buildDataInputSelect(doctors);

      // Nếu role là R2 (bác sĩ) → tự động chọn chính họ
      let selectedDoctor = {};
      if (userInfo && userInfo.roleId === "R2") {
        let doctor = dataSelect.find((item) => item.value === userInfo.id);
        if (doctor) selectedDoctor = doctor;
      }

      this.setState({
        listDoctors: dataSelect,
        selectedDoctor: selectedDoctor,
      });
    }

    if (prevProps.language !== this.props.language) {
      let doctors = this.props.allDoctors;

      // Lặp lại logic lọc khi đổi ngôn ngữ
      if (userInfo && userInfo.roleId === "R4" && userInfo.hospitalId) {
        doctors = doctors.filter(
          (doctor) => doctor.hospitalId === userInfo.hospitalId
        );
      }

      let dataSelect = this.buildDataInputSelect(doctors);
      this.setState({
        listDoctors: dataSelect,
      });
    }

    if (prevProps.allScheduleTime !== this.props.allScheduleTime) {
      let data = this.props.allScheduleTime;
      if (data && data.length > 0) {
        data = data.map((item) => ({ ...item, isSelected: false }));
      }
      this.setState({
        rangeTime: data,
      });
    }
  }

  buildDataInputSelect = (inputData) => {
    let result = [];
    if (inputData && inputData.length > 0) {
      inputData.map((item, index) => {
        let object = {};
        object.label = item.fullName;
        object.value = item.id;
        result.push(object);
      });
    }
    return result;
  };

  handleChangeSelect = async (selectedDoctor) => {
    this.setState({ selectedDoctor });
  };

  handleChangeMaxNumber = (e) => {
    this.setState({ maxNumber: e.target.value });
  };

  // handleOnChangeDatePicker = (data) => {
  //   this.setState({
  //     currentDate: data[0],
  //   });
  // };
  handleOnChangeDatePicker = (data) => {
    const selectedDate = data[0];

    // reset tất cả time về isSelected: false khi đổi ngày
    let rangeTime = this.state.rangeTime.map((item) => ({
      ...item,
      isSelected: false,
    }));

    this.setState({
      currentDate: selectedDate,
      rangeTime,
    });
  };

  handleClickBtnTime = (time) => {
    // console.log('check item time click:', time);
    let { rangeTime } = this.state;
    if (rangeTime && rangeTime.length > 0) {
      rangeTime = rangeTime.map((item) => {
        if (item.id === time.id) item.isSelected = !item.isSelected;
        return item;
      });
      this.setState({
        rangeTime: rangeTime,
      });
      // console.log('check rangeTime2 click:', rangeTime);
    }
  };

  handleSaveShedule = async () => {
    const { language } = this.props;
    let { rangeTime, selectedDoctor, currentDate } = this.state;
    let result = [];
    if (selectedDoctor && _.isEmpty(selectedDoctor)) {
      message.warning(
        language === "vi"
          ? "Vui lòng chọn chọn bác sĩ!"
          : "Invalid doctor. Please choose a doctor!"
      );
      return;
    }
    if (!currentDate) {
      message.warning(
        language === "vi"
          ? "Vui lòng chọn ngày khám!"
          : "Invalid date. Please choose a date!"
      );
      return;
    }
    // let formatedDate = moment(currentDate).format(dateFormat.SEND_TO_SERVER);
    let formatedDate = new Date(currentDate).getTime();
    if (rangeTime && rangeTime.length > 0) {
      let selectedTime = rangeTime.filter((item) => item.isSelected === true);
      if (selectedTime && selectedTime.length > 0) {
        selectedTime.map((schedule) => {
          let object = {};
          object.doctorId = selectedDoctor.value;
          object.date = formatedDate;
          object.timeType = schedule.keyMap;
          object.maxNumber = this.state.maxNumber;
          result.push(object);
        });
      } else {
        message.warning(
          language === "vi"
            ? "Vui lòng chọn thời gian lịch khám!"
            : "Invalid time. Please choose a time!"
        );
        return;
      }
    }

    let res = await saveBulkScheduleDoctor({
      arrSchedule: result,
      doctorId: selectedDoctor.value,
      formatedDate: formatedDate,
    });
    if (res && res.errCode === 0) {
      message.success(
        language === "vi"
          ? "Lưu thông tin lịch khám thành công!"
          : "Save schedule successfully!"
      );
    } else {
      message.error(
        language === "vi"
          ? "Lỗi khi lưu thông tin lịch khám!"
          : "Save schedule failed!"
      );
      console.log("Error saveBulkScheduleDoctor >>> res: ", res);
    }

    // console.log('check state khi click lưu thông tin:', this.state)
    // console.log('check result khi click lưu thông tin:', result)
    // console.log('check saveBulkScheduleDoctor khi click lưu:', res)
  };

  render() {
    let rangeTime = this.state.rangeTime;
    let { language, userInfo } = this.props;
    // console.log('check state rangeTime: ', rangeTime);
    const isDoctor = userInfo?.roleId === "R2";
    console.log("userInfohospitalId: ", userInfo.hospitalId);
    return (
      <div className="manage-schedule-container">
        <div className="m-s-title">
          <FormattedMessage id="manage-schedule.title" />
        </div>
        <div className="container">
          <div className="row">
            <div className="col-6 form-group">
              <label>
                <FormattedMessage id="manage-schedule.choose-doctor" />
              </label>
              <Select
                value={this.state.selectedDoctor}
                onChange={this.handleChangeSelect}
                options={this.state.listDoctors}
                isDisabled={isDoctor}
              />
            </div>
            <div className="col-6 form-group">
              <label>
                <FormattedMessage id="manage-schedule.choose-date" />
              </label>
              <DatePicker
                className="form-control"
                onChange={this.handleOnChangeDatePicker}
                value={this.state.currentDate}
                // minDate={moment().startOf("day").toDate()}
                minDate={moment().add(1, "days").startOf("day").toDate()}
              />
            </div>
            <div className="col-12 pick-hour-container">
              {rangeTime &&
                rangeTime.length > 0 &&
                rangeTime.map((item, index) => {
                  return (
                    <button
                      className={
                        item.isSelected === true
                          ? "btn btn-schedule active"
                          : "btn btn-schedule"
                      }
                      key={index}
                      onClick={() => this.handleClickBtnTime(item)}
                    >
                      {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                    </button>
                  );
                })}
            </div>
            <div className="col-6 form-group mt-3">
              <label className="fw-bold">Số bệnh nhân tối đa / khung giờ</label>
              <input
                type="number"
                min="1"
                className="form-control shadow-sm"
                value={this.state.maxNumber}
                onChange={this.handleChangeMaxNumber}
                placeholder="VD: 10"
              />
              <small className="text-muted">
                Mặc định: 10 bệnh nhân (bạn có thể thay đổi)
              </small>
            </div>

            <div className="col-12">
              <button
                className="btn btn-primary btn-save-schedule"
                onClick={() => this.handleSaveShedule()}
              >
                <FormattedMessage id="manage-schedule.save" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
    // lấy từ trong state redux của adminReducer
    allDoctors: state.admin.allDoctors,
    allScheduleTime: state.admin.allScheduleTime,
    userInfo: state.user.userInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllDoctorsRedux: () => dispatch(actions.fetchAllDoctors()),
    fetchAllScheduleTime: () => dispatch(actions.fetchAllScheduleTime()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageSchedule);
