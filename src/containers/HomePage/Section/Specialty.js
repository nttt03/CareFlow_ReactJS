import React, { Component } from "react";
import { connect } from "react-redux";
import { getAllSpecialty } from "../../../services/userService";
import { FormattedMessage } from "react-intl";
import { withRouter } from "react-router";
import "../HomePage.scss";
import SpecialtySkeleton from "../Skeletons/SpecialtySkeleton";

class Specialty extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSpecialty: [],
      showAll: false,
      isLoading: false,
    };
  }

  async componentDidMount() {
    try {
      this.setState({ isLoading: true });
      const res = await getAllSpecialty({ status: "A1" });
      if (res && res.errCode === 0) {
        this.setState({
          dataSpecialty: res.data ? res.data : [],
        });
      }
    } catch (error) {
      console.log("Lỗi khi lấy danh sách chuyên khoa:", error);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  handleViewDetailSpecialty = (item) => {
    if (this.props.history) {
      this.props.history.push(`/detail-specialty/${item.id}`);
    }
  };

  render() {
    const { dataSpecialty, showAll, isLoading } = this.state;
    const { language } = this.props;
    const displayData = showAll ? dataSpecialty : dataSpecialty.slice(0, 6);

    return (
      <div className="section-share section-specialty py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-4" style={{ color: "#064580" }}>
            <FormattedMessage id="homepage.specialty-popular" />
          </h2>

          <div className="row justify-content-center gy-4">
            {isLoading ? (
              <SpecialtySkeleton count={6} />
            ) : (
              displayData &&
              displayData.map((item, index) => (
                <div
                  className="col-6 col-md-4 col-lg-2"
                  key={index}
                  onClick={() => this.handleViewDetailSpecialty(item)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="specialty-box p-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="specialty-img mb-2"
                    />
                    <p className="fw-semibold text-dark m-0">{item.name}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            className="btn btn-light shadow-sm mt-4 px-4 py-2 rounded-pill"
            onClick={() => this.setState({ showAll: !showAll })}
          >
            {showAll
              ? language === "vi"
                ? "Thu gọn"
                : "Collapse"
              : language === "vi"
              ? "Xem thêm"
              : "See more"}
          </button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
});

export default withRouter(connect(mapStateToProps)(Specialty));
