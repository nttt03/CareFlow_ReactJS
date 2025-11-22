import React, { Component } from "react";
import { connect } from "react-redux";
import "./ListHospital.scss";
import HomeHeader from "../../HomePage/HomeHeader";
import HomeFooter from "../../HomePage/HomeFooter";
import { getAllHospital } from "../../../services/userService";
import { FormattedMessage } from "react-intl";
import BackButton from "../../../components/BackButton";
import { EnvironmentOutlined } from "@ant-design/icons";
import { Pagination } from "antd";
import { showLoading, hideLoading } from "../../../store/actions";
import SpecialtySkeleton from "../Specialty/SkeletonListSpecialty";

class ListHospital extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataHospitals: [],
      current: 1,
      pageSize: 8,
      total: 0,
      isLoading: false,
    };
  }

  async componentDidMount() {
    this.fetchHospitals();
  }

  fetchHospitals = async (
    page = this.state.current,
    pageSize = this.state.pageSize
  ) => {
    const { showLoading, hideLoading } = this.props;
    this.setState({ isLoading: true });
    // showLoading();
    try {
      const res = await getAllHospital({
        page,
        limit: pageSize,
      });

      if (res && res.errCode === 0) {
        this.setState({
          dataHospitals: res.data || [],
          current: res.pagination.page,
          pageSize: res.pagination.limit,
          total: res.pagination.total,
        });
      }
    } catch (error) {
      console.log("Lỗi khi lấy danh sách bệnh viện:", error);
    } finally {
      this.setState({ isLoading: false });
      // await new Promise((resolve) => setTimeout(resolve, 500));
      // hideLoading();
    }
  };

  handlePageChange = (page, pageSize) => {
    this.setState({ current: page, pageSize });
    this.fetchHospitals(page, pageSize);
  };

  handleViewDetailHospital = (hospital) => {
    if (this.props.history) {
      this.props.history.push(`/detail-hospital/${hospital.id}`);
    }
  };

  render() {
    let { dataHospitals, current, pageSize, total, isLoading } = this.state;
    let { language } = this.props;

    return (
      <React.Fragment>
        <HomeHeader />
        <div className="list-hospital">
          <div className="container">
            <BackButton
              to="/home"
              label={language === "vi" ? "Quay lại" : "Back"}
              style={{ color: "#0071ba" }}
            />
            <h2 className="list-hospital__title">
              <FormattedMessage id="homeheader.list-hospital" />
            </h2>

            <div className="row">
              {isLoading ? (
                <SpecialtySkeleton count={pageSize} />
              ) : (
                dataHospitals &&
                dataHospitals.length > 0 &&
                dataHospitals.map((item, index) => (
                  <div
                    className="col-12 col-md-3"
                    key={index}
                    onClick={() => this.handleViewDetailHospital(item)}
                  >
                    <div
                      className="card hoverable m-2 d-flex flex-column justify-content-between"
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
                ))
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

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    showLoading: () => dispatch(showLoading()),
    hideLoading: () => dispatch(hideLoading()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ListHospital);
