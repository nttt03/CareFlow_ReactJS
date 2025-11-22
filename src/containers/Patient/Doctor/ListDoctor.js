import React, { Component } from "react";
import { connect } from "react-redux";
import "./ListDoctor.scss";
import HomeHeader from "../../HomePage/HomeHeader";
import HomeFooter from "../../HomePage/HomeFooter";
import { LANGUAGES } from "../../../utils";
import { FormattedMessage } from "react-intl";
import { Buffer } from "buffer";
import DoctorImg from "../../../assets/specialty/doctor.jpg";
import BackButton from "../../../components/BackButton";
import { Rate, Pagination } from "antd";
import { showLoading, hideLoading } from "../../../store/actions";
import { getListDoctor } from "../../../services/userService";
import DoctorSkeleton from "./DoctorSkeleton";

class ListDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      arrDoctors: [],
      current: 1,
      pageSize: 9,
      total: 0,
      isLoading: false,
    };
  }

  async componentDidMount() {
    this.fetchDoctors();
  }

  fetchDoctors = async (
    page = this.state.current,
    limit = this.state.pageSize
  ) => {
    const { showLoading, hideLoading } = this.props;
    this.setState({ isLoading: true });
    // showLoading();
    try {
      let res = await getListDoctor({ page, limit });

      if (res && res.errCode === 0) {
        this.setState({
          arrDoctors: res.data || [],
          current: res.pagination.page,
          pageSize: res.pagination.limit,
          total: res.pagination.total,
        });
      }
    } catch (error) {
      console.log("Lỗi load danh sách bác sĩ:", error);
    } finally {
      this.setState({ isLoading: false });
      // await new Promise((resolve) => setTimeout(resolve, 500));
      // hideLoading();
    }
  };

  handlePageChange = (page, pageSize) => {
    this.setState({ current: page, pageSize });
    this.fetchDoctors(page, pageSize);
  };

  handleViewDetailDoctor = (doctor) => {
    if (this.props.history) {
      this.props.history.push(`/detail-doctor/${doctor.id}`);
    }
  };

  render() {
    let { arrDoctors, current, pageSize, total, isLoading } = this.state;
    const { language } = this.props;

    return (
      <React.Fragment>
        <HomeHeader />
        <div className="list-doctor-container">
          <div className="list-doctor-content">
            <BackButton
              to="/home"
              label={language === "vi" ? "Quay lại" : "Back"}
              style={{ color: "#0071ba" }}
            />
            <h2 className="section-title mt-1">
              <FormattedMessage id="homeheader.list-doctor" />
            </h2>

            <div className="row">
              {isLoading ? (
                <DoctorSkeleton count={6} />
              ) : arrDoctors && arrDoctors.length > 0 ? (
                arrDoctors.map((item, index) => {
                  let imageBase64 = "";
                  if (item.avatar) {
                    imageBase64 = Buffer.from(item.avatar, "base64").toString(
                      "binary"
                    );
                  }

                  let name =
                    language === LANGUAGES.VI
                      ? `${item.positionData?.valueVi || "Bác sĩ"}, ${
                          item.fullName
                        }`
                      : `${item.positionData?.valueEn || "Doctor"}, ${
                          item.fullName
                        }`;

                  const specialtyName =
                    item.doctorInfor?.specialty?.name || "Chưa xác định";

                  return (
                    <div
                      className="col-12 col-sm-6 col-md-4"
                      key={index}
                      onClick={() => this.handleViewDetailDoctor(item)}
                    >
                      <div className="doctor-item">
                        <div
                          className="doctor-image"
                          style={{
                            backgroundImage: `url(${imageBase64 || DoctorImg})`,
                          }}
                        ></div>
                        <div className="doctor-info text-center">
                          <div className="doctor-name">{name}</div>
                          <div className="doctor-specialty mb-2">
                            {specialtyName}
                          </div>
                          {item.doctorInfor?.rating && (
                            <Rate
                              disabled
                              allowHalf
                              value={Number(item.doctorInfor.rating) || 0}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>Không có bác sĩ nào để hiển thị.</p>
              )}
            </div>

            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                marginTop: 24,
                marginBottom: 24,
              }}
            >
              <Pagination
                current={current}
                total={total}
                pageSize={pageSize}
                onChange={this.handlePageChange}
                showSizeChanger={false}
              />
            </div>
          </div>
        </div>
        <HomeFooter />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
});

const mapDispatchToProps = (dispatch) => ({
  showLoading: () => dispatch(showLoading()),
  hideLoading: () => dispatch(hideLoading()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ListDoctor);
