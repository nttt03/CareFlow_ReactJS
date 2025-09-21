import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";

class Home extends Component {
  render() {
    const { isLoggedIn, roleId } = this.props;

    // Nếu chưa hydrate xong => đợi
    if (isLoggedIn && !roleId) {
      return null; // hoặc loading spinner
    }

    if (!isLoggedIn) {
      return <Redirect to="/home" />;
    }

    switch (roleId) {
      case "R1":
        return <Redirect to="/system/user-manage" />;
      case "R2":
        return <Redirect to="/doctor/manage-schedule" />;
      case "R3":
        return <Redirect to="/home" />;
      default:
        return <Redirect to="/login" />;
    }

    return null;
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    roleId: state.user.userInfo?.roleId,
  };
};

export default connect(mapStateToProps)(Home);
