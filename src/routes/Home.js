import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

class Home extends Component {

    render() {
        const { isLoggedIn, roleId } = this.props;
        // let linkToRedirect = isLoggedIn ? '/system/user-manage' : '/home';
        let linkToRedirect = '/home'; // mặc định

        if (isLoggedIn) {
            if (roleId === 'R1' || roleId === 'R2') {
                linkToRedirect = '/system/user-manage';
            } else if (roleId === 'R3') {
                linkToRedirect = '/home';  // hoặc bất kỳ path nào bạn muốn cho bệnh nhân
            }
        }


        return (
            <Redirect to={linkToRedirect} />
        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        roleId: state.user.userInfo?.roleId  // thêm dòng này
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
