import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import './HomeHeader.scss'
import { LANGUAGES } from '../../utils';
import { changeLanguageApp } from '../../store/actions';
import { withRouter } from 'react-router';
import * as actions from "../../store/actions";
import { injectIntl } from 'react-intl';

class HomeHeader extends Component {

    changeLanguage = (language) => {
        // alert(language)
        // fire redux event : actions
        this.props.changeLanguageAppRedux(language)
    }

    returnToHome = () => {
        if (this.props.history) {
            this.props.history.push(`/home`)
        }
    }

    handleViewListSpecialty = () => {
        if (this.props.history) {
            this.props.history.push(`/list-specialty`)
        }
    }

    handleViewListClinic = () => {
        if (this.props.history) {
            this.props.history.push(`/list-clinic`)
        }
    }

    handleViewListDoctor = () => {
        if (this.props.history) {
            this.props.history.push(`/list-doctor`)
        }
    }

    handleViewNewAppointment = () => {
        if (this.props.history) {
            this.props.history.push(`/new-appointment`)
        }
    }

    render() {
        const { intl } = this.props;
        const placeholderText = intl.formatMessage({ id: 'banner.placeholder' });
        // console.log('check: ', this.props)

        // language này đc lấy từ trong redux ra (trong mapStateToProps bên dưới) chứ ko phải truyền từ cha sang con
        let language = this.props.language;
        const { userInfo, processLogout, isLoggedIn } = this.props;
        return (
            <React.Fragment>
                <div className='home-header-container'>
                    <div className='home-header-content'>
                        <div className='left-content'>
                            <i className="fas fa-bars"></i>
                            <div className='header-logo' onClick={() => this.returnToHome()}></div>
                        </div>
                        <div className='center-content'>
                            <div className='child-content'
                                onClick={() => this.handleViewListSpecialty()}
                            >
                                <div><b><FormattedMessage id="homeheader.speciality" /></b></div>
                                <div className='subs-title'><FormattedMessage id="homeheader.search-doctor" /></div>
                            </div>
                            <div className='child-content'
                                onClick={() => this.handleViewListClinic()}
                            >
                                <div><b><FormattedMessage id="homeheader.health-facility" /></b></div>
                                <div className='subs-title'><FormattedMessage id="homeheader.select-room" /></div>
                            </div>
                            <div className='child-content'
                                onClick={() => this.handleViewListDoctor()}
                            >
                                <div><b><FormattedMessage id="homeheader.doctor" /></b></div>
                                <div className='subs-title'><FormattedMessage id="homeheader.select-doctor" /></div>
                            </div>
                            <div className='child-content'
                                onClick={() => this.handleViewNewAppointment()}
                            >
                                <div><b><FormattedMessage id="homeheader.package" /></b></div>
                                <div className='subs-title'><FormattedMessage id="homeheader.check-health" /></div>
                            </div>
                        </div>
                        <div className='right-content'>
                            {isLoggedIn ? (
                                <div className='sign-in-out-content'>
                                    <span className=''>
                                        <FormattedMessage id="homeheader.welcome" />, {userInfo && userInfo.firstName ? userInfo.firstName : ''}!
                                    </span>
                                    <div className="btn btn-logout" onClick={processLogout} title='Logout'>
                                        <i className="fas fa-sign-out-alt"></i>
                                    </div>
                                </div>
                            ) : (
                                <div className='sign-in-out-content'>
                                    <div className='btn btn-login' onClick={() => this.props.history.push('/login')}>
                                        <FormattedMessage id="homeheader.login" defaultMessage="Sign in" />
                                    </div>
                                    <div className='btn btn-register' onClick={() => this.props.history.push('/register')}>
                                        <FormattedMessage id="homeheader.register" defaultMessage="Sign up" />
                                    </div>
                                </div>
                            )}

                            {/* <div className='support'><i className="fas fa-question-circle me-2"></i><FormattedMessage id="homeheader.support" /></div> */}
                            <div className='language-content'>
                                <div className={language === LANGUAGES.VI ? 'language-vi active' : 'language-vi'} >
                                    <span onClick={() => this.changeLanguage(LANGUAGES.VI)}>VN</span>
                                </div>
                                <div className={language === LANGUAGES.EN ? 'language-en active' : 'language-en'} >
                                    <span onClick={() => this.changeLanguage(LANGUAGES.EN)}>EN</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {this.props.isShowBanner === true &&
                    <div className='home-header-banner'>
                        <div className='content-up'>
                            <div className='title1'><FormattedMessage id="banner.title1" /></div>
                            <div className='title2'><FormattedMessage id="banner.title2" /></div>
                            <div className='search'>
                                <i className="fas fa-search"></i>
                                <input type="text" placeholder={placeholderText} />
                            </div>
                        </div>
                        <div className='content-down'>
                            <div className='options'>
                                <div className='option-child'>
                                    <div className='icon-child'><i className="fas fa-hospital"></i></div>
                                    <div className='text-child'><FormattedMessage id="banner.child1" /></div>
                                </div>
                                <div className='option-child'>
                                    <div className='icon-child'><i className="fas fa-mobile-alt"></i></div>
                                    <div className='text-child'><FormattedMessage id="banner.child2" /></div>
                                </div>
                                <div className='option-child'>
                                    <div className='icon-child'><i className="fas fa-stethoscope"></i></div>
                                    <div className='text-child'><FormattedMessage id="banner.child3" /></div>
                                </div>
                                <div className='option-child'>
                                    <div className='icon-child'><i className="fas fa-notes-medical"></i></div>
                                    <div className='text-child'><FormattedMessage id="banner.child4" /></div>
                                </div>
                                <div className='option-child'>
                                    <div className='icon-child'><i className="fas fa-sun"></i></div>
                                    <div className='text-child'><FormattedMessage id="banner.child5" /></div>
                                </div>
                                <div className='option-child'>
                                    <div className='icon-child'><i className="fas fa-plus-circle"></i></div>
                                    <div className='text-child'><FormattedMessage id="banner.child6" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </React.Fragment>
        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        language: state.app.language,
        userInfo: state.user.userInfo,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        processLogout: () => dispatch(actions.processLogout()),
        // fire 1 action redux (action là changeLanguageApp đầu vào là language)
        changeLanguageAppRedux: (language) => dispatch(changeLanguageApp(language))
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(injectIntl(HomeHeader)));
