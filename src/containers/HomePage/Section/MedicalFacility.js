import React, { Component } from "react";
import { connect } from "react-redux";
import "./Slider.scss";
import Slider from "react-slick";
import { FormattedMessage } from "react-intl";
import { getAllHospital } from "../../../services/userService";
import { withRouter } from "react-router";

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataHospitals: [],
    };
  }

  async componentDidMount() {
    let res = await getAllHospital();
    if (res && res.errCode === 0) {
      this.setState({
        dataHospitals: res.data ? res.data : [],
      });
    }
    // console.log('check res hospital', res);
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
    let { dataHospitals } = this.state;
    return (
      <div className="section-share section-medical-facility">
        <div className="section-container">
          <div className="section-header">
            <span>
              <FormattedMessage id="homepage.medical-facility-outstanding" />
            </span>
            <button
              className="btn btn-secondary px-3"
              onClick={() => this.handleViewListHospital()}
            >
              <FormattedMessage id="homepage.more-infor" />
            </button>
          </div>

          <div className="section-body">
            <Slider {...this.props.settings}>
              {dataHospitals &&
                dataHospitals.length > 0 &&
                dataHospitals.map((item, index) => {
                  return (
                    <div
                      className="section-customize slider-child"
                      key={index}
                      onClick={() => this.handleViewDetailHospital(item)}
                    >
                      <div className="customize-border-slider">
                        <img className="bg-image-slider" src={item.image} />
                        <span className="name-slider">{item.name}</span>
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
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(HomePage)
);
