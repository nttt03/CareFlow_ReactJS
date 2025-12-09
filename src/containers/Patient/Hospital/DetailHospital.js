import React, { Component } from "react";
import { connect } from "react-redux";
import "../Specialty/DetailSpecialty.scss";
import { LANGUAGES } from "../../../utils";
import HomeHeader from "../../HomePage/HomeHeader";
import HomeFooter from "../../HomePage/HomeFooter";
import DoctorSchedule from "../Doctor/DoctorSchedule";
import DoctorExtraInfor from "../Doctor/DoctorExtraInfor";
import * as actions from "../../../store/actions";
import ProfileDoctor from "../Doctor/ProfileDoctor";
import {
  getAllDetailHospitalById,
  toggleFavorite,
  getAllCodeService,
} from "../../../services/userService";
import _ from "lodash";
import { EnvironmentOutlined, HeartFilled } from "@ant-design/icons";
import { Tooltip, message, Card } from "antd";
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
      selectedSpecialtyId: null,
      hospitalId: "",
      isFavorite: false,
      allFavorites: [],
    };
  }

  async componentDidMount() {
    this.props.fetchUserFavorite(this.props.userInfo?.id);
    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id
    ) {
      let id = this.props.match.params.id;
      this.setState({ hospitalId: id });

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

  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.selectedSpecialtyId !== this.state.selectedSpecialtyId) {
      // Nếu thay đổi specialtyId, gọi API hoặc lọc danh sách bác sĩ
      await this.filterDoctorsBySpecialty();
    }
    if (
      prevProps.userInfo?.id !== this.props.userInfo?.id &&
      this.props.userInfo?.id
    ) {
      this.props.fetchUserFavorite(this.props.userInfo.id);
    }
    if (
      prevProps.allFavorites !== this.props.allFavorites &&
      this.state.hospitalId
    ) {
      const isFavorite = this.props.allFavorites.some(
        (fav) => fav.hospitalId === Number(this.state.hospitalId)
      );
      this.setState({ isFavorite });
    }
  }

  filterDoctorsBySpecialty = async () => {
    const { dataDetailHospital, selectedSpecialtyId } = this.state;
    if (
      selectedSpecialtyId &&
      dataDetailHospital &&
      dataDetailHospital.doctors
    ) {
      const filteredDoctors = dataDetailHospital.doctors.filter(
        (doctor) => doctor.specialtyId === selectedSpecialtyId
      );
      const arrDoctorId = filteredDoctors.map((doctor) => doctor.doctorId);
      this.setState({ arrDoctorId });
    } else {
      // Nếu không có specialtyId được chọn, hiển thị tất cả bác sĩ
      const arrDoctorId = dataDetailHospital.doctors
        ? dataDetailHospital.doctors.map((doctor) => doctor.doctorId)
        : [];
      this.setState({ arrDoctorId });
    }
  };

  handleSpecialtyClick = (specialtyId) => {
    this.setState({ selectedSpecialtyId: specialtyId });
  };

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

  handleToggleFavorite = async () => {
    const { userInfo } = this.props;
    const { hospitalId } = this.state;

    if (!userInfo) {
      return message.warning("Vui lòng đăng nhập để thêm vào yêu thích!");
    }

    try {
      const res = await toggleFavorite(userInfo.id, hospitalId, null);

      if (res && res.errCode === 0) {
        this.setState({ isFavorite: res.isFavorite });
        if (res.isFavorite) {
          message.success("Đã thêm vào danh sách yêu thích ❤️");
        } else {
          message.info("Đã xóa khỏi danh sách yêu thích 💔");
        }
      }
    } catch (error) {
      console.error("Error in toggleFavorite:", error);
      message.error("Đã có lỗi xảy ra!");
    }
  };

  render() {
    let {
      arrDoctorId,
      dataDetailHospital,
      isShowFullDescription,
      selectedSpecialtyId,
    } = this.state;
    let { language } = this.props;
    // console.log("allFavorites: ", this.props.allFavorites);

    return (
      <div className="detail-specialty-container">
        <HomeHeader />
        <div
          className="detail-specialty-body"
          style={{
            minHeight: "90vh",
          }}
        >
          <div className="description-specialty container px-3 px-md-5">
            <BackButton
              to="/list-hospital"
              label={language === "vi" ? "Quay lại" : "Back"}
              style={{ color: "#0071ba" }}
            />
            {dataDetailHospital && !_.isEmpty(dataDetailHospital) && (
              <>
                <div className="d-flex flex-column flex-md-row justify-content-between border-bottom">
                  <div className="d-flex gap-3 justify-content-center align-items-center my-3">
                    <img
                      className="border border-light shadow-sm p-2 rounded-pill"
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
                  <div
                    className={`d-flex gap-2 align-items-center p-3 rounded-pill ${
                      this.state.isFavorite ? "bg-light" : ""
                    }`}
                    style={{ cursor: "pointer", height: "20px" }}
                    onClick={this.handleToggleFavorite}
                  >
                    <HeartFilled
                      className={`fs-4 ${
                        this.state.isFavorite ? "text-danger" : "text-secondary"
                      }`}
                    />
                    <span>
                      {this.state.isFavorite
                        ? language === "vi"
                          ? "Yêu thích"
                          : "Liked"
                        : language === "vi"
                        ? "Yêu thích"
                        : "Like"}
                    </span>
                  </div>
                </div>
                <div
                  className={`description-content mt-3 ${
                    isShowFullDescription ? "expanded" : "collapsed"
                  }`}
                  style={{
                    maxHeight: isShowFullDescription ? "1000px" : "200px",
                    overflow: "hidden",
                    transition: "max-height 0.3s ease-in-out",
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
            {(() => {
              const specialties = dataDetailHospital?.specialties || [];
              const doctors = dataDetailHospital?.doctors || [];

              const filteredSpecialties = specialties.filter((spec) =>
                doctors.some((doc) => doc.specialtyId === spec.specialtyId)
              );

              if (filteredSpecialties.length === 0) return null;

              return (
                <div className="specialties-section mt-4">
                  <h2 className="specialties-title text-primary">
                    {language === "vi"
                      ? "Chọn Chuyên khoa cần khám"
                      : "Select Specialties"}
                  </h2>
                  <div className="d-flex flex-nowrap overflow-x-auto pb-3">
                    {filteredSpecialties.map((specialty) => (
                      <div
                        className="specialty-item p-2 flex-shrink-0"
                        key={specialty.specialtyId}
                        onClick={() =>
                          this.handleSpecialtyClick(specialty.specialtyId)
                        }
                      >
                        <div
                          className={`card specialty-card shadow-sm border-0 text-center ${
                            selectedSpecialtyId === specialty.specialtyId
                              ? "bg-light shadow"
                              : ""
                          }`}
                          style={{
                            cursor: "pointer",
                            minWidth: "180px",
                            transition: "all 0.25s ease-in-out",
                          }}
                        >
                          <div className="card-body p-3 d-flex flex-column align-items-center">
                            <img
                              alt={specialty?.specialty?.name}
                              src={Buffer.from(
                                specialty?.specialty?.image,
                                "base64"
                              ).toString("binary")}
                              className="img-fluid rounded-circle"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                              }}
                            />
                            <h6
                              className="fw-semibold text-dark text-truncate mt-2"
                              style={{ maxWidth: "150px" }}
                            >
                              {specialty?.specialty?.name}
                            </h6>
                            <span className="badge bg-success-subtle text-success fw-semibold mt-2 px-3 py-2">
                              {language === "vi" ? "Giá: " : "Price: "}
                              {this.formatPrice(specialty.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="list-doctor">
              {arrDoctorId &&
                arrDoctorId.length > 0 &&
                arrDoctorId.map((item, index) => {
                  return (
                    <div className="each-doctor bg-light" key={index}>
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
                          <DoctorSchedule
                            doctorIdFromParent={item}
                            hospitalId={this.state.hospitalId}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
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
    userInfo: state.user.userInfo,
    allFavorites: state.admin.allFavorites,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchUserFavorite: (userId) =>
      dispatch(actions.fetchAllUserFavoriteStart(userId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailHospital);
