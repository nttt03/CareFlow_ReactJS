import React, { Component } from "react";
import { connect } from "react-redux";
import { LANGUAGES } from "../../../utils";
import { getExtraInforDoctorById } from "../../../services/userService";
import { FormattedMessage } from "react-intl";
import NumberFormat from "react-number-format";
import "bootstrap/dist/css/bootstrap.min.css";

class DoctorExtraInfor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowDetailInfor: false,
      extraInfor: {},
    };
  }

  async componentDidMount() {
    if (this.props.doctorIdFromParent) {
      let res = await getExtraInforDoctorById(this.props.doctorIdFromParent);
      if (res && res.errCode === 0) {
        this.setState({ extraInfor: res.data });
      }
    }
  }

  async componentDidUpdate(prevProps) {
    if (this.props.doctorIdFromParent !== prevProps.doctorIdFromParent) {
      let res = await getExtraInforDoctorById(this.props.doctorIdFromParent);
      if (res && res.errCode === 0) {
        this.setState({ extraInfor: res.data });
      }
    }
  }

  showHideDetailInfor = (status) => {
    this.setState({ isShowDetailInfor: status });
  };

  render() {
    let { isShowDetailInfor, extraInfor } = this.state;
    let { language } = this.props;

    // Lấy thông tin cần hiển thị
    const hospitalName = extraInfor?.hospital?.name || "";
    const specialtyName =
      extraInfor?.specialty?.name || language === "vi"
        ? "Thông tin đang được cập nhật..."
        : "Information is being updated...";
    const address = `${extraInfor?.hospital?.addressDetail || ""}, ${
      extraInfor?.hospital?.provinceData?.name || ""
    }`;
    const note = extraInfor?.note || "";

    return (
      <div className="doctor-extra-infor-container container p-4 rounded shadow-sm bg-light mt-3">
        <h5 className="fw-bold text-primary mb-3">
          <FormattedMessage
            id="patient.extra-infor-doctor.clinic-info"
            defaultMessage={
              language === "vi"
                ? "Thông tin khám bệnh"
                : "Medical examination information"
            }
          />
        </h5>

        {/* Thông tin địa điểm */}
        <div className="mb-3">
          <h6 className="mb-1 text-secondary">
            <FormattedMessage
              id="patient.extra-infor-doctor.text-address"
              defaultMessage={
                language === "vi" ? "Địa chỉ khám" : "Examination address"
              }
            />
          </h6>
          <p className="mb-0 fw-semibold">{hospitalName}</p>
          <p className="mb-0">{address}</p>
        </div>

        {/* Chuyên khoa */}
        <div className="mb-3">
          <h6 className="text-secondary">
            <FormattedMessage
              id="patient.extra-infor-doctor.specialty"
              defaultMessage={language === "vi" ? "Chuyên khoa" : "Specialty"}
            />
          </h6>
          <p className="fw-semibold">{specialtyName}</p>
        </div>

        {/* Ghi chú */}
        {note && (
          <div className="mb-3">
            <h6 className="text-secondary">
              <FormattedMessage
                id="patient.extra-infor-doctor.note"
                defaultMessage={language === "vi" ? "Ghi chú" : "Note"}
              />
            </h6>
            <p className="fst-italic">{note}</p>
          </div>
        )}

        {/* Giá khám */}
        <div className="content-down">
          {!isShowDetailInfor ? (
            <div className="short-infor">
              <span className="fw-semibold me-2 text-secondary">
                <FormattedMessage
                  id="patient.extra-infor-doctor.price"
                  defaultMessage={language === "vi" ? "Giá khám:" : "Price:"}
                />
              </span>
              {extraInfor?.price && (
                <NumberFormat
                  className="fw-bold text-success"
                  value={extraInfor.price}
                  displayType={"text"}
                  thousandSeparator={true}
                  suffix={" VNĐ"}
                />
              )}
              <button
                className="btn btn-link p-0 ms-2"
                onClick={() => this.showHideDetailInfor(true)}
              >
                <FormattedMessage
                  id="patient.extra-infor-doctor.detail"
                  defaultMessage={
                    language === "vi" ? "Xem chi tiết" : "See details"
                  }
                />
              </button>
            </div>
          ) : (
            <div className="border-top pt-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-secondary fw-semibold">
                  <FormattedMessage
                    id="patient.extra-infor-doctor.price"
                    defaultMessage={language === "vi" ? "Giá khám:" : "Price:"}
                  />
                </span>
                {extraInfor?.price ? (
                  <NumberFormat
                    value={extraInfor.price}
                    displayType={"text"}
                    thousandSeparator={true}
                    suffix={" VNĐ"}
                    className="fw-bold text-success"
                  />
                ) : (
                  <span>
                    {language === "vi" ? "Chưa cập nhật" : "Not updated yet"}
                  </span>
                )}
              </div>

              {note && <div className="mb-2 text-muted small">{note}</div>}

              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => this.showHideDetailInfor(false)}
              >
                <FormattedMessage
                  id="patient.extra-infor-doctor.hide"
                  defaultMessage={
                    language === "vi" ? "Ẩn thông tin" : "Hide information"
                  }
                />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
});

export default connect(mapStateToProps)(DoctorExtraInfor);
