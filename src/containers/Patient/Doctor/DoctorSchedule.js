import React, { Component } from "react";
import { connect } from "react-redux";
// import "./DoctorSchedule.scss";
import moment from "moment";
import "moment/locale/vi";
import { LANGUAGES } from "../../../utils";
import { getScheduleDoctorByDate } from "../../../services/userService";
import { FormattedMessage } from "react-intl";
import BookingModal from "./Modal/BookingModal";
import { Select, Button, Empty, Card, Typography } from "antd";
import { CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import "bootstrap/dist/css/bootstrap.min.css";

const { Option } = Select;
const { Title, Text } = Typography;

class DoctorSchedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allDays: [],
      allAvailableTime: [],
      isOpenModalBooking: false,
      dataScheduleTimeModal: {},
      selectedDay: null,
    };
  }

  getArrDays = (language) => {
    let allDays = [];
    let currentDate = moment(new Date()).startOf("day");

    for (let i = 0; i < 7; i++) {
      let object = {};
      let loopDate = moment(new Date()).add(i, "days").startOf("day");
      let dateFormatted = loopDate.format("DD/MM");

      if (language === LANGUAGES.VI) {
        let dayLabel = "";
        if (loopDate.isSame(currentDate, "day")) {
          dayLabel = "Hôm nay";
        } else if (loopDate.isSame(currentDate.clone().add(1, "days"), "day")) {
          dayLabel = "Ngày mai";
        } else {
          dayLabel = loopDate.format("dddd");
          dayLabel = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1);
        }
        object.label = `${dayLabel} - ${dateFormatted}`;
      } else {
        let dayLabel = "";
        if (loopDate.isSame(currentDate, "day")) {
          dayLabel = "Today";
        } else if (loopDate.isSame(currentDate.clone().add(1, "days"), "day")) {
          dayLabel = "Tomorrow";
        } else {
          dayLabel = loopDate.locale("en").format("ddd");
        }
        object.label = `${dayLabel} - ${dateFormatted}`;
      }

      object.value = loopDate.valueOf();
      allDays.push(object);
    }
    return allDays;
  };

  async componentDidMount() {
    let { language } = this.props;
    let allDays = this.getArrDays(language);
    let selectedDay = allDays[0].value;

    if (this.props.doctorIdFromParent) {
      let res = await getScheduleDoctorByDate(
        this.props.doctorIdFromParent,
        allDays[0].value
      );
      this.setState({
        allAvailableTime: res?.data || [],
      });
    }

    this.setState({ allDays, selectedDay });
  }

  async componentDidUpdate(prevProps) {
    if (this.props.language !== prevProps.language) {
      let allDays = this.getArrDays(this.props.language);
      this.setState({ allDays });
    }

    if (this.props.doctorIdFromParent !== prevProps.doctorIdFromParent) {
      let allDays = this.getArrDays(this.props.language);
      let res = await getScheduleDoctorByDate(
        this.props.doctorIdFromParent,
        allDays[0].value
      );
      this.setState({
        allAvailableTime: res?.data || [],
      });
    }
  }

  handleOnChangeSelect = async (value) => {
    this.setState({ selectedDay: value });
    if (this.props.doctorIdFromParent && this.props.doctorIdFromParent !== -1) {
      let doctorId = this.props.doctorIdFromParent;
      let res = await getScheduleDoctorByDate(doctorId, value);

      if (res && res.errCode === 0) {
        this.setState({
          allAvailableTime: res.data || [],
        });
      }
    }
  };

  handleClickScheduleTime = (time) => {
    this.setState({
      isOpenModalBooking: true,
      dataScheduleTimeModal: time,
    });
  };

  closeBookingModal = () => {
    this.setState({ isOpenModalBooking: false });
  };

  render() {
    let {
      allDays,
      allAvailableTime,
      isOpenModalBooking,
      dataScheduleTimeModal,
      selectedDay,
    } = this.state;
    let { language } = this.props;

    const filterFutureSlots = (allAvailableTime, language) => {
      const now = Date.now();

      return allAvailableTime.filter((item) => {
        // Lấy ngày của slot
        let slotDate = moment(parseInt(item.date)).startOf("day");

        // Lấy giờ bắt đầu của slot
        let startTime =
          language === "vi"
            ? item.timeTypeData.valueVi.split(" - ")[0]
            : item.timeTypeData.valueEn.split(" - ")[0];

        // Parse giờ và phút
        let [hour, minute] = startTime.split(/[: ]/).map((x) => parseInt(x));

        // Nếu là tiếng Anh và có PM, cộng thêm 12h
        if (
          language === "en" &&
          startTime.toUpperCase().includes("PM") &&
          hour < 12
        ) {
          hour += 12;
        }
        if (
          language === "en" &&
          startTime.toUpperCase().includes("AM") &&
          hour === 12
        ) {
          hour = 0;
        }

        // Tạo timestamp đầy đủ của slot
        let slotDateTime = slotDate
          .clone()
          .hours(hour)
          .minutes(minute)
          .seconds(0)
          .milliseconds(0)
          .valueOf();

        // Nếu slot trong ngày hôm nay → so sánh với thời gian hiện tại
        if (slotDate.isSame(moment(), "day")) {
          return slotDateTime > now;
        }

        // Nếu slot ngày khác → hiển thị tất cả
        return true;
      });
    };

    const futureSlots = filterFutureSlots(allAvailableTime, language);

    return (
      <>
        <Card
          className="border-0 mt-3"
          styles={{
            body: { padding: "20px 25px" },
          }}
        >
          <div className="d-flex align-items-center justify-content-between mb-3">
            <Title level={5} className="mb-0 text-primary">
              <CalendarOutlined className="me-2" />
              <FormattedMessage id="patient.detail-doctor.schedule" />
            </Title>

            <Select
              value={selectedDay}
              style={{ width: 200 }}
              onChange={this.handleOnChangeSelect}
            >
              {allDays.map((day, index) => (
                <Option key={index} value={day.value}>
                  {day.label}
                </Option>
              ))}
            </Select>
          </div>
          <div className="mt-3">
            {allAvailableTime && allAvailableTime.length > 0 ? (
              <>
                <div className="d-flex flex-wrap gap-2">
                  {futureSlots.map((item, index) => (
                    <Button
                      key={index}
                      type="primary"
                      icon={<ClockCircleOutlined />}
                      onClick={() => this.handleClickScheduleTime(item)}
                      style={{ minWidth: "200px" }}
                    >
                      {language === LANGUAGES.VI
                        ? item.timeTypeData.valueVi
                        : item.timeTypeData.valueEn}
                    </Button>
                  ))}
                </div>

                <div className="text-muted mt-3 small">
                  <FormattedMessage id="patient.detail-doctor.choose" />{" "}
                  <i className="far fa-hand-point-up"></i>{" "}
                  <FormattedMessage id="patient.detail-doctor.book-free" />
                </div>
              </>
            ) : (
              <Empty
                description={
                  <FormattedMessage id="patient.detail-doctor.no-schedule" />
                }
              />
            )}
          </div>
        </Card>

        <BookingModal
          isOpenModal={isOpenModalBooking}
          closeBookingModal={this.closeBookingModal}
          dataTime={dataScheduleTimeModal}
          hospitalId={this.props.hospitalId}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
});

export default connect(mapStateToProps)(DoctorSchedule);
