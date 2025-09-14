import React, { Component } from "react";
import { connect } from "react-redux";
import "./ListHospital.scss";
import HomeHeader from "../../HomePage/HomeHeader";
import HomeFooter from "../../HomePage/HomeFooter";
import { getAllHospital } from "../../../services/userService";
import { FormattedMessage } from "react-intl";

class ListHospital extends Component {
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

  handleViewDetailHospital = (hospital) => {
    if (this.props.history) {
      this.props.history.push(`/detail-hospital/${hospital.id}`);
    }
  };

  render() {
    let { dataHospitals } = this.state;
    return (
      <React.Fragment>
        <HomeHeader />
        <div className="list-hospital">
          <div className="container">
            <h2 className="list-hospital__title">
              <FormattedMessage id="homeheader.list-hospital" />
            </h2>
            <div className="row">
              {dataHospitals &&
                dataHospitals.length > 0 &&
                dataHospitals.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className="col-md-3 col-sm-6 col-12"
                      onClick={() => this.handleViewDetailHospital(item)}
                    >
                      <div className="list-hospital__content">
                        <div className="list-hospital__content__item">
                          <div className="list-hospital__content__item__image">
                            <img src={item.image} />
                          </div>
                          <div className="list-hospital__content__item__info">
                            <div className="list-hospital__content__item__info__name">
                              {item.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

export default connect(mapStateToProps)(ListHospital);
