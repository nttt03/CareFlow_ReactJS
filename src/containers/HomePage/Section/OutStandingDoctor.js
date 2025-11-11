import React, { Component } from "react";
import { connect } from "react-redux";
import Slider from "react-slick";
import DoctorImg from "../../../assets/specialty/doctor.jpg";
import * as actions from "../../../store/actions";
import { LANGUAGES } from "../../../utils";
import { FormattedMessage } from "react-intl";
import { withRouter } from "react-router";
import { Buffer } from "buffer";
import { CrownOutlined } from "@ant-design/icons";
import { Rate } from "antd";

class OutStandingDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      arrDoctors: [],
    };
  }

  componentDidMount() {
    this.props.loadTopDoctors();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.topDoctorsRedux !== this.props.topDoctorsRedux) {
      this.setState({
        arrDoctors: this.props.topDoctorsRedux,
      });
    }
  }

  handleViewDetailDoctor = (doctor) => {
    if (this.props.history) {
      this.props.history.push(`/detail-doctor/${doctor.id}`);
    }
  };

  handleViewListDoctor = () => {
    if (this.props.history) {
      this.props.history.push(`/list-doctor`);
    }
  };

  render() {
    let arrDoctors = this.state.arrDoctors;
    let { language } = this.props;

    return (
      <div className="section-share section-outstanding-doctor">
        <div className="section-container">
          <div className="section-header">
            <span className="fw-bold mb-4" style={{ color: "#064580" }}>
              <FormattedMessage id="homepage.outstanding-doctor" />
            </span>
            <button
              className="btn btn-secondary px-3"
              onClick={() => this.handleViewListDoctor()}
            >
              <FormattedMessage id="homepage.more-infor" />
            </button>
          </div>

          <div className="section-body mb-5">
            <Slider {...this.props.settings}>
              {arrDoctors &&
                arrDoctors.length > 0 &&
                arrDoctors.map((item, index) => {
                  let imageBase64 = null;
                  if (item.avatar) {
                    imageBase64 = Buffer.from(item.avatar, "base64").toString(
                      "binary"
                    );
                  }

                  let nameVi = `${item.positionData?.valueVi || "Bác sĩ"}, ${
                    item.fullName
                  }`;
                  let nameEn = `${item.positionData?.valueEn || "Doctor"}, ${
                    item.fullName
                  }`;

                  let specialtyName =
                    item.doctorInfor &&
                    item.doctorInfor.specialty &&
                    item.doctorInfor.specialty.name
                      ? item.doctorInfor.specialty.name
                      : "Chưa xác định";

                  const isTop3 = index < 3;
                  return (
                    <div
                      className="section-customize position-relative"
                      key={index}
                      onClick={() => this.handleViewDetailDoctor(item)}
                    >
                      {isTop3 && (
                        <div
                          className="animate__animated animate__pulse animate__infinite"
                          style={{
                            position: "absolute",
                            top: "5px",
                            right: "18px",
                            background: "white",
                            borderRadius: "50%",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            // boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                            zIndex: 10,
                            border: "2px solid white",
                          }}
                        >
                          <CrownOutlined
                            style={{
                              fontSize: "22px",
                              color: "#f7b30b",
                              filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))",
                            }}
                          />
                        </div>
                      )}

                      <div
                        className="mx-3 text-white card hoverable border-0 shadow-sm text-center p-3 doctor-card"
                        style={{
                          background: "#f3f4f4",
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: "12px",
                          minHeight: "210px",
                        }}
                      >
                        <img
                          src={imageBase64 || DoctorImg}
                          alt={item.fullName}
                          className="rounded-circle mx-auto"
                          style={{
                            width: "90px",
                            height: "90px",
                            objectFit: "cover",
                            border: "2px solid #eee",
                            marginTop: "8px",
                          }}
                        />

                        <h5 className="mt-3 mb-1 fw-bold text-primary">
                          {language === LANGUAGES.VI ? nameVi : nameEn}
                        </h5>
                        <p className="fs-10 mb-2 text-primary">
                          {specialtyName}
                        </p>
                        {item.doctorInfor?.rating && (
                          <Rate
                            disabled
                            allowHalf
                            value={Number(item.doctorInfor?.rating) || 0}
                            style={{
                              color: "#FFD700",
                              fontSize: "18px",
                              margin: "auto",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
            </Slider>
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
    topDoctorsRedux: state.admin.topDoctors,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadTopDoctors: () => dispatch(actions.fetchTopDoctor()),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(OutStandingDoctor)
);
