import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import "./NewAppointment.scss";
import HomeHeader from "../../HomePage/HomeHeader";
import HomeFooter from "../../HomePage/HomeFooter";
import { FormattedMessage } from "react-intl";
import {
  getNewAppointment,
  getDoneAppointment,
} from "../../../services/userService";
import emptyImg from "../../../assets/empty.png";
import { Card, Row, Col, Empty, Tabs, Pagination, message } from "antd";
import moment from "moment";

const { TabPane } = Tabs;

class NewAppointment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newAppointments: [],
      doneAppointments: [],
      isDataFetched: false,
      activeTab: "new",
      currentPage: 1,
      itemsPerPage: 3,
    };
  }

  componentDidMount() {
    this.fetchAppointments("new");
  }

  fetchAppointments = async (tab) => {
    const { userInfo } = this.props;
    if (!userInfo || !userInfo.id) {
      message.warning("Bạn cần đăng nhập để xem lịch hẹn!");
      return;
    }

    try {
      if (tab === "new") {
        const res = await getNewAppointment(userInfo.id);
        if (res && res.errCode === 0) {
          // Lọc các lịch hẹn từ ngày hiện tại trở đi
          const todayTimestamp = new Date().setHours(0, 0, 0, 0);
          const upcoming =
            res.dataAppointments?.filter(
              (a) => parseInt(a.date) >= todayTimestamp
            ) || [];
          this.setState({ newAppointments: upcoming, isDataFetched: true });
        }
      } else if (tab === "done") {
        const res = await getDoneAppointment(userInfo.id);
        if (res && res.errCode === 0) {
          this.setState({
            doneAppointments: res.dataAppointments || [],
            isDataFetched: true,
          });
        }
      }
    } catch (e) {
      console.error(e);
      message.error("Lỗi khi tải dữ liệu lịch hẹn!");
    }
  };

  formatDate = (timestamp) => moment(+timestamp).format("DD/MM/YYYY");

  handleTabChange = (key) => {
    this.setState({ activeTab: key, currentPage: 1 }, () => {
      if (key === "done" && this.state.doneAppointments.length === 0) {
        this.fetchAppointments("done");
      }
    });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  renderStatus = (status, statusData, isVietnamese) => {
    let className = "status-badge ";
    let text = "";

    switch (status) {
      case "S2": // Đã xác nhận
        className += "status-confirmed"; // CSS: xanh dương
        text = isVietnamese ? "Đã xác nhận" : "Confirmed";
        break;
      case "S4": // Đã hoàn thành (ví dụ dùng S3)
        className += "status-done"; // CSS: xanh lá
        text = isVietnamese ? "Đã hoàn thành" : "Done";
        break;
      case "S5": // Đã hủy
        className += "status-cancel";
        text = isVietnamese ? "Đã hủy" : "Cancelled";
        break;
      case "S1": // Chờ duyệt
        className += "status-waiting";
        text = isVietnamese ? "Chờ duyệt" : "Waiting";
        break;
      default:
        className += "status-default";
        text = isVietnamese
          ? statusData?.valueVi
          : statusData?.valueEn || "N/A";
    }

    return <span className={className}>{text}</span>;
  };

  render() {
    const {
      newAppointments,
      doneAppointments,
      activeTab,
      currentPage,
      itemsPerPage,
    } = this.state;
    const { language } = this.props;
    const isVietnamese = language === "vi";

    const dataToShow = activeTab === "new" ? newAppointments : doneAppointments;

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentAppointments = dataToShow.slice(indexOfFirst, indexOfLast);

    return (
      <>
        <HomeHeader />
        <div
          className="container"
          style={{ paddingTop: "100px", minHeight: "100vh" }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={this.handleTabChange}
            type="line"
          >
            <TabPane
              tab={
                <FormattedMessage id="patient.appointment-patient.new-appointment" />
              }
              key="new"
            />
            <TabPane
              tab={
                <FormattedMessage id="patient.appointment-patient.done-appointment" />
              }
              key="done"
            />
          </Tabs>

          {currentAppointments.length > 0 ? (
            <Row gutter={[16, 16]}>
              {currentAppointments.map((a, idx) => (
                <Col xs={24} sm={24} md={12} lg={8} key={idx}>
                  <Card
                    hoverable
                    bordered={false}
                    className="appointment-card"
                    title={this.renderStatus(
                      a.statusId,
                      a.statusData,
                      isVietnamese
                    )}
                  >
                    <div className="appointment-card-content">
                      <p>
                        <b>
                          <FormattedMessage id="patient.appointment-patient.doctor" />
                        </b>{" "}
                        <span className="text-primary fw-bold">
                          {`${
                            isVietnamese
                              ? a.infoDataDoctor?.positionData?.valueVi
                              : a.infoDataDoctor?.positionData?.valueEn || ""
                          } ${a.infoDataDoctor?.fullName || ""}`}
                        </span>
                      </p>
                      <p>
                        <b>
                          <FormattedMessage id="patient.appointment-patient.date" />
                        </b>{" "}
                        <span className="text-primary">
                          {this.formatDate(a.date)}
                        </span>
                      </p>
                      <p>
                        <b>
                          <FormattedMessage id="patient.appointment-patient.time" />
                        </b>{" "}
                        <span className="text-primary">
                          {isVietnamese
                            ? a.timeTypeDataPatient?.valueVi
                            : a.timeTypeDataPatient?.valueEn || "-"}
                        </span>
                      </p>
                      <p>
                        <b>
                          <FormattedMessage id="patient.appointment-patient.hospital" />
                        </b>{" "}
                        {a.doctorInfoData?.hospital?.name || "-"}
                      </p>
                      <p>
                        <b>
                          <FormattedMessage id="patient.appointment-patient.address" />
                        </b>{" "}
                        {a.doctorInfoData?.hospital?.addressDetail || "-"}
                        {a.doctorInfoData?.hospital?.provinceData?.name
                          ? `, ${a.doctorInfoData.hospital.provinceData.name}`
                          : ""}
                      </p>
                      {a?.rejectReason && (
                        <p className="text-danger fw-bold">
                          <b>
                            <FormattedMessage id="patient.appointment-patient.reason" />
                          </b>{" "}
                          {a.rejectReason}
                        </p>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              description={
                <FormattedMessage id="patient.appointment-patient.title-none-new" />
              }
              image={emptyImg}
              imageStyle={{ height: 120 }}
            />
          )}

          {dataToShow.length > itemsPerPage && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination
                current={currentPage}
                pageSize={itemsPerPage}
                total={dataToShow.length}
                onChange={this.handlePageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
        <HomeFooter />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
  userInfo: state.user.userInfo,
});

export default withRouter(connect(mapStateToProps)(NewAppointment));
