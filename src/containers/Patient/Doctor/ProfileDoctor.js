import React, { Component } from 'react';
import { connect } from "react-redux";
import './ProfileDoctor.scss';
import { FormattedMessage } from 'react-intl';
import { getProfileDoctorById } from '../../../services/userService';
import { LANGUAGES } from '../../../utils';
import NumberFormat, { NumericFormat } from 'react-number-format';
import _ from 'lodash';
import moment from 'moment';
import { Link } from 'react-router-dom';

class ProfileDoctor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataProfile: {}
        }

    }

    async componentDidMount() {
        let data = await this.getInforDoctor(this.props.doctorId);
        this.setState({
            dataProfile: data
        });
    }

    getInforDoctor = async (id) => {
        let result = {};
        if (id) {
            let res = await getProfileDoctorById(id);
            // console.log('check profile doctor >>>', res);
            if (res && res.errCode === 0) {
                result = res.data;
            }
        }
        return result;
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.doctorId !== this.props.doctorId) {
            let data = await this.getInforDoctor(this.props.doctorId);
            this.setState({
                dataProfile: data,
            });
        }
    }

    renderTimeBooking = (dataTime) => {
        let { language } = this.props;
        if (dataTime && !_.isEmpty(dataTime)) {
            let time = language === LANGUAGES.VI ? dataTime.timeTypeData.valueVi : dataTime.timeTypeData.valueEn;
            let date = language === LANGUAGES.VI ?
                moment.unix(+dataTime.date / 1000).format('dddd - DD/MM/YYYY')
                :
                moment.unix(+dataTime.date / 1000).locale('en').format('ddd - MM/DD/YYYY')
            return (
                <>
                    <div className='time'>{time} - {date}</div>
                    <div className='time'><FormattedMessage id="patient.booking-modal.free" /></div>
                </>
            )
        }
        return <></>
    }

    render() {
        // console.log('check state profileDoctor: ', this.state);
        let { dataProfile } = this.state;
        let { language, isShowDescriptionDoctor, dataTime, isShowLinkDetail, isShowPrice, doctorId } = this.props;
        let nameVi, nameEn = '';
        if (dataProfile && dataProfile.positionData) {
            nameVi = `${dataProfile.positionData.valueVi}, ${dataProfile.lastName} ${dataProfile.firstName}`;
            nameEn = `${dataProfile.positionData.valueEn}, ${dataProfile.firstName} ${dataProfile.lastName}`;
        }
        return (

            <div className='profile-doctor-container'>
                <div className='intro-doctor'>
                    <div className='content-left'
                        style={{ backgroundImage: `url(${dataProfile && dataProfile.image ? dataProfile.image : ''})` }}>
                    </div>
                    <div className='content-right'>
                        <div className='up'>
                            {language === LANGUAGES.VI ? nameVi : nameEn}
                        </div>
                        <div className='down'>
                            {isShowDescriptionDoctor === true ?
                                <>
                                    {dataProfile && dataProfile.Markdown && dataProfile.Markdown.description &&
                                        <span>
                                            {dataProfile.Markdown.description}
                                        </span>
                                    }
                                </> :
                                <>
                                    {this.renderTimeBooking(dataTime)}
                                </>
                            }
                        </div>
                    </div>
                </div>
                {isShowLinkDetail === true &&
                    <div className='view-detail-doctor'>
                        <Link to={`/detail-doctor/${doctorId}`}><FormattedMessage id="homepage.more-infor" /></Link>
                    </div>
                }
                {/* price */}
                {isShowPrice === true &&
                    <div className='price'>
                        <FormattedMessage id="patient.booking-modal.price" />
                        {
                            dataProfile && dataProfile.Doctor_Infor && language === LANGUAGES.VI &&
                            <NumberFormat
                                value={dataProfile.Doctor_Infor.priceTypeData.valueVi}
                                displayType={'text'}
                                thousandSeparator={true}
                                suffix={' VNĐ'}
                            />
                        }
                        {
                            dataProfile && dataProfile.Doctor_Infor && language === LANGUAGES.EN &&
                            <NumberFormat
                                value={dataProfile.Doctor_Infor.priceTypeData.valueEn}
                                displayType={'text'}
                                thousandSeparator={true}
                                suffix={'$'}
                            />
                        }
                    </div>
                }

            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileDoctor);
