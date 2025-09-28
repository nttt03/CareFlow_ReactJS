import React, { Component } from "react";
import { connect } from "react-redux";
import Slider from "react-slick";
import DoctorImg from "../../../assets/specialty/doctor.jpg";
import * as actions from "../../../store/actions";
import { LANGUAGES } from "../../../utils";
import { FormattedMessage } from "react-intl";
import { Redirect } from "react-router-dom";
import { withRouter } from "react-router";
import { Buffer } from "buffer";

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
    // console.log('check view detail doctor....', doctor);
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
    // console.log('data topdotor: ', this.props.topDoctorsRedux)
    let arrDoctors = this.state.arrDoctors;
    // console.log('arrDoctor: ', arrDoctors);
    let { language } = this.props;
    // arrDoctors = arrDoctors.concat(arrDoctors)
    return (
      <div className="section-share section-outstanding-doctor">
        <div className="section-container">
          <div className="section-header">
            <span>
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
                  let imageBase64 = "";
                  if (item.image) {
                    imageBase64 = Buffer.from(item.image, "base64").toString(
                      "binary"
                    );
                  }

                  let nameVi = `${item.positionData?.valueVi || "Bác sĩ"}, ${
                    item.fullName
                  }`;
                  let nameEn = `${item.positionData?.valueEn || "Doctor"}, ${
                    item.fullName
                  }`;

                  // Kiểm tra và hiển thị tên chuyên khoa, nếu không có thì hiển thị "Chưa xác định"
                  let specialtyName =
                    item.doctorInfor &&
                    item.doctorInfor.specialty &&
                    item.doctorInfor.specialty.name
                      ? item.doctorInfor.specialty.name
                      : "Chưa xác định";
                  return (
                    <div
                      className="section-customize"
                      key={index}
                      onClick={() => this.handleViewDetailDoctor(item)}
                    >
                      <div
                        style={{ background: "navy" }}
                        className="mx-3 text-white card hoverable border-0 shadow-sm text-center p-3 doctor-card"
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
                          }}
                        />

                        <h5 className="mt-3 mb-1 fw-bold">
                          {language === LANGUAGES.VI ? nameVi : nameEn}
                        </h5>
                        <p className="small mb-0 text-white">{specialtyName}</p>
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
