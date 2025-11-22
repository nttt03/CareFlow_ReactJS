import React, { Component } from "react";
import { connect } from "react-redux";
import "./ListSpecialty.scss";
import HomeHeader from "../../HomePage/HomeHeader";
import HomeFooter from "../../HomePage/HomeFooter";
import { getAllSpecialty } from "../../../services/userService";
import { FormattedMessage } from "react-intl";
import BackButton from "../../../components/BackButton";
import { Pagination } from "antd";
import { showLoading, hideLoading } from "../../../store/actions";
import SpecialtySkeleton from "./SkeletonListSpecialty";

class ListSpecialty extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSpecialty: [],
      current: 1,
      pageSize: 8,
      total: 0,
      isLoading: false,
    };
  }

  componentDidMount() {
    this.fetchSpecialty();
  }

  fetchSpecialty = async (
    page = this.state.current,
    pageSize = this.state.pageSize
  ) => {
    const { showLoading, hideLoading } = this.props;
    this.setState({ isLoading: true });
    showLoading();

    try {
      const res = await getAllSpecialty({
        page,
        limit: pageSize,
      });

      if (res && res.errCode === 0) {
        const { data, pagination } = res;
        this.setState({
          dataSpecialty: data || [],
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
        });
      }
    } catch (error) {
      console.log("Lỗi khi lấy danh sách chuyên khoa:", error);
    } finally {
      this.setState({ isLoading: false });
      await new Promise((resolve) => setTimeout(resolve, 600));
      hideLoading();
    }
  };

  onPageChange = (page, pageSize) => {
    this.setState({ current: page, pageSize }, () =>
      this.fetchSpecialty(page, pageSize)
    );
  };

  handleViewDetailSpecialty = (item) => {
    if (this.props.history) {
      this.props.history.push(`/detail-specialty/${item.id}`);
    }
  };

  render() {
    let { dataSpecialty, current, pageSize, total, isLoading } = this.state;
    let { language } = this.props;

    return (
      <React.Fragment>
        <HomeHeader />
        <div className="list-specialty">
          <div className="container">
            <BackButton
              to="/home"
              label={language === "vi" ? "Quay lại" : "Back"}
              style={{ color: "#0071ba" }}
            />

            <h2 className="list-specialty__title">
              <FormattedMessage id="homeheader.list-specialty" />
            </h2>

            <div className="row">
              {isLoading ? (
                <SpecialtySkeleton count={pageSize} />
              ) : (
                dataSpecialty.map((item) => (
                  <div
                    key={item.id}
                    className="col-md-3 col-sm-6 col-12"
                    onClick={() => this.handleViewDetailSpecialty(item)}
                  >
                    <div className="list-specialty__content">
                      <div className="list-specialty__content__item">
                        <div className="list-specialty__content__item__image">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="list-specialty__content__item__info">
                          <div className="list-specialty__content__item__info__name">
                            {item.name}
                          </div>
                        </div>
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
              }}
            >
              <Pagination
                current={current}
                total={total}
                pageSize={pageSize}
                onChange={this.onPageChange}
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

export default connect(mapStateToProps, mapDispatchToProps)(ListSpecialty);
