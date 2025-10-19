import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import HomeHeader from "../../HomePage/HomeHeader";
import HomeFooter from "../../HomePage/HomeFooter";
import {
  getDetailInforDoctor,
  toggleFavorite,
} from "../../../services/userService";
import * as actions from "../../../store/actions";
import { LANGUAGES } from "../../../utils";
import DoctorSchedule from "./DoctorSchedule";
import DoctorExtraInfor from "./DoctorExtraInfor";
import DoctorImg from "../../../assets/specialty/doctor.jpg";
import "bootstrap/dist/css/bootstrap.min.css";
import { Buffer } from "buffer";
import { message } from "antd";
import { HeartFilled } from "@ant-design/icons";

class DetailDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detailDoctor: {},
      currentDoctorId: -1,
      showFullDescription: false,
      isFavorite: false,
    };
  }

  async componentDidMount() {
    this.props.fetchUserFavorite(this.props.userInfo?.id);
    if (this.props.match?.params?.id) {
      const id = this.props.match.params.id;
      this.setState({ currentDoctorId: id });
      const res = await getDetailInforDoctor(id);
      if (res && res.errCode === 0) {
        this.setState({ detailDoctor: res.data });
      }
    }
  }

  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.userInfo?.id !== this.props.userInfo?.id &&
      this.props.userInfo?.id
    ) {
      this.props.fetchUserFavorite(this.props.userInfo.id);
    }
    if (
      prevProps.allFavorites !== this.props.allFavorites &&
      this.state.currentDoctorId
    ) {
      const isFavorite = this.props.allFavorites.some(
        (fav) => fav.doctorId === Number(this.state.currentDoctorId)
      );
      this.setState({ isFavorite });
    }
  }

  handleToggleFavorite = async () => {
    const { userInfo } = this.props;
    const { currentDoctorId } = this.state;

    if (!userInfo) {
      return message.warning("Vui lòng đăng nhập để thêm vào yêu thích!");
    }

    try {
      const res = await toggleFavorite(userInfo.id, null, currentDoctorId);

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

  toggleDescription = () => {
    this.setState((prev) => ({
      showFullDescription: !prev.showFullDescription,
    }));
  };

  render() {
    const { language } = this.props;
    const { detailDoctor, showFullDescription } = this.state;

    let nameVi,
      nameEn = "";
    const positionVi = detailDoctor?.positionData?.valueVi || "Bác sĩ";
    const positionEn = detailDoctor?.positionData?.valueEn || "Doctor";

    nameVi = `${positionVi}, ${detailDoctor?.fullName || ""}`;
    nameEn = `${positionEn}, ${detailDoctor?.fullName || ""}`;

    const description =
      detailDoctor?.Markdown?.description || "Thông tin đang được cập nhật...";

    const currentURL =
      +process.env.REACT_APP_IS_LOCALHOST === 1
        ? "https://github.com/nttt03"
        : window.location.href;

    return (
      <Fragment>
        <HomeHeader isShowBanner={false} />
        <div
          className="container px-0 px-lg-5"
          style={{ paddingTop: "5%", minHeight: "100vh" }}
        >
          <div className="container my-4">
            <div className="bg-white p-4 rounded-3 shadow-sm intro-doctor">
              <div className="row align-items-center g-3">
                {/* Cột ảnh */}
                <div className="col-12 col-md-auto d-flex justify-content-center">
                  <img
                    src={
                      detailDoctor && detailDoctor?.avatar
                        ? Buffer.from(detailDoctor.avatar, "base64").toString(
                            "binary"
                          )
                        : DoctorImg
                    }
                    alt={detailDoctor?.fullName || "doctor"}
                    className="rounded-circle border border-light shadow-sm"
                    style={{
                      width: 130,
                      height: 130,
                      objectFit: "cover",
                    }}
                  />
                </div>

                {/* Cột tên + mô tả */}
                <div className="col-12 col-md">
                  <h4 className="fw-bold mb-2 text-primary">
                    {language === LANGUAGES.VI ? nameVi : nameEn}
                  </h4>

                  <p
                    className="text-muted mb-2"
                    style={{
                      overflow: showFullDescription ? "visible" : "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: showFullDescription ? "unset" : 3,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {description}
                  </p>

                  {description?.length > 100 && (
                    <button
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={this.toggleDescription}
                    >
                      {showFullDescription ? "Thu gọn ▲" : "Xem thêm ▼"}
                    </button>
                  )}
                </div>

                {/* Nút yêu thích — nằm bên phải, canh đều chiều cao */}
                <div className="col-12 col-md-auto text-md-end text-center">
                  <div
                    className={`d-inline-flex gap-2 align-items-center px-3 py-2 rounded-pill ${
                      this.state.isFavorite ? "bg-light" : ""
                    }`}
                    style={{ cursor: "pointer" }}
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
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-12 col-md-5">
              <DoctorExtraInfor
                doctorIdFromParent={this.state.currentDoctorId}
              />
            </div>

            <div className="col-12 col-md-7">
              <DoctorSchedule doctorIdFromParent={this.state.currentDoctorId} />
            </div>
          </div>

          {detailDoctor?.Markdown?.contentHTML && (
            <div className="bg-white p-4 rounded-3 shadow-sm mb-4">
              <h5 className="fw-bold text-primary mb-3">Giới thiệu chi tiết</h5>
              <div
                dangerouslySetInnerHTML={{
                  __html: detailDoctor.Markdown.contentHTML,
                }}
              ></div>
            </div>
          )}
        </div>

        <HomeFooter />
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
  userInfo: state.user.userInfo,
  allFavorites: state.admin.allFavorites,
});

const mapDispatchToProps = (dispatch) => {
  return {
    fetchUserFavorite: (userId) =>
      dispatch(actions.fetchAllUserFavoriteStart(userId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailDoctor);
