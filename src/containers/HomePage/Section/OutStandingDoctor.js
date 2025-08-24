import React, { Component } from 'react';
import { connect } from 'react-redux';
import Slider from 'react-slick';
import specialtyImg from '../../../assets/specialty/doctor.jpg';
import * as actions from '../../../store/actions';
import { LANGUAGES } from '../../../utils';
import { FormattedMessage } from 'react-intl';
import { Redirect } from 'react-router-dom';
import { withRouter } from 'react-router';

class OutStandingDoctor extends Component {
    constructor(props) {
        super(props)
        this.state = {
            arrDoctors: []
        }
    }

    componentDidMount() {
        this.props.loadTopDoctors();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.topDoctorsRedux !== this.props.topDoctorsRedux) {
            this.setState({
                arrDoctors: this.props.topDoctorsRedux
            })
        }
    }

    handleViewDetailDoctor = (doctor) => {
        // console.log('check view detail doctor....', doctor);
        if (this.props.history) {
            this.props.history.push(`/detail-doctor/${doctor.id}`)
        }
    }

    handleViewListDoctor = () => {
        if (this.props.history) {
            this.props.history.push(`/list-doctor`)
        }
    }


    render() {
        // console.log('data topdotor: ', this.props.topDoctorsRedux)
        let arrDoctors = this.state.arrDoctors;
        // console.log('arrDoctor: ', arrDoctors);
        let { language } = this.props;
        // arrDoctors = arrDoctors.concat(arrDoctors)
        return (
            <div className='section-share section-outstanding-doctor'>
                <div className='section-container'>

                    <div className='section-header'>
                        <span><FormattedMessage id="homepage.outstanding-doctor" /></span>
                        <button className='btn btn-secondary px-3'
                            onClick={() => this.handleViewListDoctor()}
                        ><FormattedMessage id="homepage.more-infor" />
                        </button>
                    </div>

                    <div className='section-body'>
                        <Slider {...this.props.settings}>

                            {arrDoctors && arrDoctors.length > 0
                                && arrDoctors.map((item, index) => {
                                    let imageBase64 = '';
                                    if (item.image) {
                                        imageBase64 = new Buffer(item.image, 'base64').toString('binary');
                                    }

                                    let nameVi = `${item.positionData.valueVi}, ${item.lastName} ${item.firstName}`;
                                    let nameEn = `${item.positionData.valueEn}, ${item.firstName} ${item.lastName}`;
                                    // Kiểm tra và hiển thị tên chuyên khoa, nếu không có thì hiển thị "Chưa xác định"
                                    let specialtyName = item.Doctor_Infor && item.Doctor_Infor.Specialty && item.Doctor_Infor.Specialty.name
                                        ? item.Doctor_Infor.Specialty.name
                                        : "Chưa xác định";
                                    return (
                                        <div className='section-customize' key={index}
                                            onClick={() => this.handleViewDetailDoctor(item)}
                                        >
                                            {/* <img className='bg-image bg-image-doctor' src={specialtyImg} /> */}
                                            <div className='customize-border'>
                                                <div className='outer-bg'>
                                                    <div className='bg-image section-outstanding-doctor'
                                                        style={{ backgroundImage: `url(${imageBase64 || specialtyImg})` }}
                                                    ></div>
                                                </div>
                                                <div className='position text-center'>
                                                    <div style={{ fontWeight: 600 }}>{language === LANGUAGES.VI ? nameVi : nameEn}</div>
                                                    <div>{specialtyName}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                        </Slider>
                    </div>

                </div>


            </div>
        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        language: state.app.language,
        topDoctorsRedux: state.admin.topDoctors,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        loadTopDoctors: () => dispatch(actions.fetchTopDoctor())
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OutStandingDoctor));
