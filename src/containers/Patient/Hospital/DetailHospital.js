import React, { Component } from "react";
import { connect } from "react-redux";
import "./DetailHospital.scss";
import { LANGUAGES } from "../../../utils";
import HomeHeader from "../../HomePage/HomeHeader";
import HomeFooter from "../../HomePage/HomeFooter";
import DoctorSchedule from "../Doctor/DoctorSchedule";
import DoctorExtraInfor from "../Doctor/DoctorExtraInfor";
import ProfileDoctor from "../Doctor/ProfileDoctor";
import {
  getAllDetailHospitalById,
  getAllCodeService,
} from "../../../services/userService";
import _ from "lodash";
import { EnvironmentOutlined, HeartFilled } from "@ant-design/icons";
import { Tooltip, Row, Col, Card } from "antd";
import { Buffer } from "buffer";
import BackButton from "../../../components/BackButton";

const { Meta } = Card;

class DetailHospital extends Component {
  constructor(props) {
    super(props);
    this.state = {
      arrDoctorId: [],
      dataDetailHospital: {},
      isShowFullDescription: false,
    };
  }

  async componentDidMount() {
    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id
    ) {
      let id = this.props.match.params.id;

      let res = await getAllDetailHospitalById({
        id: id,
      });

      if (res && res.errCode === 0) {
        let data = res.data;
        let arrDoctorId = [];
        if (data && !_.isEmpty(res.data)) {
          let arr = data.doctors;
          if (arr && arr.length > 0) {
            arr.map((item) => {
              arrDoctorId.push(item.doctorId);
            });
          }
        }

        this.setState({
          dataDetailHospital: res.data,
          arrDoctorId: arrDoctorId,
        });
      }
    }
  }

  async componentDidUpdate(prevProps, prevState, snapshot) {}

  toggleDescription = () => {
    this.setState((prevState) => ({
      isShowFullDescription: !prevState.isShowFullDescription,
    }));
  };

  formatPrice = (price) => {
    if (!price) {
      return this.props.language === LANGUAGES.VI ? "Chưa rõ" : "N/A";
    }
    // Chuyển giá thành chuỗi và thêm dấu chấm ngăn cách hàng nghìn
    return `${Number(price).toLocaleString("vi-VN")}đ`;
  };

  render() {
    let { arrDoctorId, dataDetailHospital, isShowFullDescription } = this.state;
    let { language } = this.props;

    return (
      <div className="detail-specialty-container">
        <HomeHeader />
        <div className="detail-specialty-body">
          <div className="description-specialty container px-3 px-md-5">
            <BackButton
              to="/home"
              label={language === "vi" ? "Quay lại" : "Back"}
              style={{ color: "#0071ba" }}
            />
            {dataDetailHospital && !_.isEmpty(dataDetailHospital) && (
              <>
                <div className="d-flex flex-column flex-md-row justify-content-between border-bottom">
                  <div className="d-flex gap-3 justify-content-center align-items-center aligh">
                    <img
                      className="border border-primary p-2 rounded-4"
                      alt={dataDetailHospital.name}
                      src={dataDetailHospital?.image}
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                      }}
                    />
                    <div style={{ margin: "0 !important" }}>
                      <h1 className="title text-start">
                        {dataDetailHospital.name}
                      </h1>
                      <EnvironmentOutlined className="text-primary fs-5" />{" "}
                      {dataDetailHospital?.addressDetail}{" "}
                      {dataDetailHospital?.provinceData?.name}
                    </div>
                  </div>
                  <Tooltip
                    color="magenta"
                    title={
                      language === "vi"
                        ? "Thêm vào danh sách yêu thích"
                        : "Add to favorites"
                    }
                    placement="top"
                  >
                    <div
                      className="d-flex gap-2 align-items-center border border-primary p-3 rounded-pill"
                      style={{ cursor: "pointer", height: "20px" }}
                    >
                      <HeartFilled className="text-secondary fs-4" />

                      <span>{language === "vi" ? "Yêu thích" : "Like"}</span>
                    </div>
                  </Tooltip>
                </div>
                <div
                  className={`description-content ${
                    isShowFullDescription ? "expanded" : "collapsed"
                  }`}
                  style={{
                    maxHeight: isShowFullDescription ? "1000px" : "200px",
                    overflow: "hidden",
                    transition: "max-height 0.3s ease-in-out", // Smooth transition
                  }}
                  dangerouslySetInnerHTML={{
                    __html: dataDetailHospital?.descriptionHTML,
                  }}
                ></div>
                <div className="text-end mt-2">
                  <button
                    className="btn btn-link"
                    onClick={this.toggleDescription}
                  >
                    {isShowFullDescription
                      ? language === "vi"
                        ? "Ẩn bớt"
                        : "Show less"
                      : language === "vi"
                      ? "Xem thêm"
                      : "Show more"}
                  </button>
                </div>
              </>
            )}
            {/* Chuyên khoa */}
            <div className="specialties-section mt-4">
              <h2 className="specialties-title">
                {language === "vi"
                  ? "Chọn Chuyên khoa cần khám"
                  : "Select Specialties"}
              </h2>
              <div className="row">
                {dataDetailHospital?.specialties &&
                  dataDetailHospital.specialties.length > 0 &&
                  dataDetailHospital.specialties.map((specialty, index) => (
                    <div
                      className="specialty-item col-12 col-md-3 p-3"
                      key={index}
                    >
                      <div className="card d-flex specialty-card h-100">
                        <div className="card-body d-flex gap-3 align-items-center px-3">
                          <img
                            style={{ width: "80px", height: "80px" }}
                            alt={specialty?.specialty?.name}
                            src={Buffer.from(
                              specialty?.specialty?.image,
                              "base64"
                            ).toString("binary")}
                            className="specialty-image"
                          />
                          <div className="specialty-info">
                            <h5 className="card-title mb-2">
                              {specialty?.specialty.name}
                            </h5>
                            <span
                              style={{ whiteSpace: "nowrap" }}
                              className="specialty-price px-2 py-1 bg-success text-white rounded-pill"
                            >
                              {language === "vi" ? "Giá: " : "Price: "}
                              {this.formatPrice(specialty.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="list-doctor">
            {arrDoctorId &&
              arrDoctorId.length > 0 &&
              arrDoctorId.map((item, index) => {
                return (
                  <div className="each-doctor" key={index}>
                    <div className="detail-content-left">
                      <div className="profile-doctor">
                        <ProfileDoctor
                          doctorId={item}
                          isShowDescriptionDoctor={true}
                          isShowLinkDetail={true}
                          isShowPrice={false}
                        />
                      </div>
                    </div>
                    <div className="detail-content-right">
                      <div className="doctor-schedule">
                        <DoctorSchedule doctorIdFromParent={item} />
                      </div>
                      <div className="doctor-extra-infor">
                        <DoctorExtraInfor doctorIdFromParent={item} />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        <HomeFooter />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailHospital);
