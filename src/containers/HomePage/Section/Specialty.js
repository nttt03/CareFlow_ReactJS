import React, { Component } from "react";
import { connect } from "react-redux";
import Slider from "react-slick";
import { getAllSpecialty } from "../../../services/userService";
import { FormattedMessage } from "react-intl";
import { withRouter } from "react-router";
import "../HomePage.scss";

class Specialty extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSpecialty: [],
    };
  }

  async componentDidMount() {
    const res = await getAllSpecialty();
    console.log("check getAllSpecialty: ", res);
    if (res && res.errCode === 0) {
      this.setState({
        dataSpecialty: res.data ? res.data : [],
      });
    }
  }

  handleViewListSpecialty = () => {
    if (this.props.history) {
      this.props.history.push(`/list-specialty`);
    }
  };

  handleViewDetailSpecialty = (item) => {
    // console.log('check view detail doctor....', doctor);
    if (this.props.history) {
      this.props.history.push(`/detail-specialty/${item.id}`);
    }
  };

  render() {
    let { dataSpecialty } = this.state;
    // console.log('check state chuyên khoa: ', this.state)
    return (
      <div className="section-share section-specialty">
        <div className="section-container">
          <div className="section-header">
            <span>
              <FormattedMessage id="homepage.specialty-popular" />
            </span>
            <button
              className="btn btn-secondary px-3"
              onClick={() => this.handleViewListSpecialty()}
            >
              <FormattedMessage id="homepage.more-infor" />
            </button>
          </div>

          <div className="section-body mb-5">
            <Slider {...this.props.settings}>
              {dataSpecialty &&
                dataSpecialty.length > 0 &&
                dataSpecialty.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className="px-3"
                      onClick={() => this.handleViewDetailSpecialty(item)}
                    >
                      <div className="card hoverable text-center border-0 shadow-sm specialty-card">
                        <div className="card-img-top d-flex justify-content-center align-items-center p-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="img-fluid rounded"
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                        <div className="card-body p-2">
                          <h6 className="specialty-name bold text-truncate">
                            {item.name}
                          </h6>
                        </div>
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
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Specialty)
);
