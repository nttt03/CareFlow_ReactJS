import React, { Component } from "react";
import { connect } from "react-redux";
import Slider from "react-slick";
import { Card } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import { FormattedMessage } from "react-intl";
import { getAllHospital } from "../../../services/userService";
import { withRouter } from "react-router";
import "./Slider.scss";
import SpecialtySkeleton from "../../Patient/Specialty/SkeletonListSpecialty";

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataHospitals: [],
      isLoading: false,
    };
  }

  async componentDidMount() {
    try {
      this.setState({ isLoading: true });
      let res = await getAllHospital();
      if (res && res.errCode === 0) {
        this.setState({
          dataHospitals: res.data || [],
        });
      }
    } catch (error) {
      console.log("Lỗi khi lấy danh sách bệnh viện:", error);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  handleViewListHospital = () => {
    if (this.props.history) {
      this.props.history.push(`/list-hospital`);
    }
  };

  handleViewDetailHospital = (hospital) => {
    if (this.props.history) {
      this.props.history.push(`/detail-hospital/${hospital.id}`);
    }
  };

  render() {
    const { dataHospitals, isLoading } = this.state;

    return isLoading ? (
      <div className="section-share section-medical-facility">
        <div className="section-container">
          <div className="section-header">
            <span className="fw-bold mb-4" style={{ color: "#064580" }}>
              <FormattedMessage id="homepage.medical-facility-outstanding" />
            </span>
            <button
              className="btn btn-secondary px-3"
              onClick={this.handleViewListHospital}
            >
              <FormattedMessage id="homepage.more-infor" />
            </button>
          </div>

          <div className="section-body mb-5">
            <SpecialtySkeleton />
          </div>
        </div>
      </div>
    ) : (
      <div className="section-share section-medical-facility">
        <div className="section-container">
          <div className="section-header">
            <span className="fw-bold mb-4" style={{ color: "#064580" }}>
              <FormattedMessage id="homepage.medical-facility-outstanding" />
            </span>
            <button
              className="btn btn-secondary px-3"
              onClick={this.handleViewListHospital}
            >
              <FormattedMessage id="homepage.more-infor" />
            </button>
          </div>

          <div className="section-body mb-5">
            <Slider {...this.props.settings}>
              {dataHospitals.map((item, index) => (
                <div
                  key={index}
                  onClick={() => this.handleViewDetailHospital(item)}
                >
                  <div
                    className="card hoverable mx-2 d-flex flex-column justify-content-between"
                    style={{
                      height: 320,
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <div className="position-relative">
                      <img
                        src="/bg-hospital.jpg"
                        alt={item.name}
                        className="w-100"
                        style={{ height: 120, objectFit: "cover" }}
                      />
                      <img
                        src={item.logo || item.image}
                        alt="Logo"
                        className="position-absolute bg-white border"
                        style={{
                          bottom: -25,
                          left: "22%",
                          transform: "translateX(-50%)",
                          width: 100,
                          height: 100,
                          borderRadius: 8,
                          padding: 10,
                          objectFit: "cover",
                          borderColor: "#ccc",
                        }}
                      />
                    </div>

                    <div
                      className="card-body text-center"
                      style={{ marginTop: 30 }}
                    >
                      <h5 className="bold">{item.name}</h5>
                      <p
                        className="text-muted small mt-n2"
                        style={{ fontSize: 14 }}
                      >
                        <EnvironmentOutlined /> {item.addressDetail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.user.isLoggedIn,
});

export default withRouter(connect(mapStateToProps)(HomePage));
