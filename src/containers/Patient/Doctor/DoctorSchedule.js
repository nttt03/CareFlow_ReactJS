import React, { Component } from 'react';
import { connect } from "react-redux";
import './DoctorSchedule.scss';
import moment from 'moment';
import localization from 'moment/locale/vi';
import { LANGUAGES } from '../../../utils';
import { getScheduleDoctorByDate } from '../../../services/userService';
import { FormattedMessage } from 'react-intl';
import BookingModal from './Modal/BookingModal';

class DoctorSchedule extends Component {

    constructor(props) {
        super(props);
        this.state = {
            allDays: [],
            allAvailableTime: [],
            isOpenModalBooking: false,
            dataScheduleTimeModal: {}
        }
    }

    // getArrDays = (language) => {
    //     let allDays = [];
    //     for (let i = 0; i < 7; i++) {
    //         let object = {};
    //         if (language === LANGUAGES.VI) {
    //             object.label = moment(new Date()).add(i, 'days').format('dddd - DD/MM');
    //         } else {
    //             object.label = moment(new Date()).add(i, 'days').locale('en').format('ddd - DD/MM');
    //         }
    //         object.value = moment(new Date()).add(i, 'days').startOf('day').valueOf();

    //         allDays.push(object);
    //     }

    //     console.log('allDays: ', allDays);
    //     this.setState({
    //         allDays: allDays
    //     });
    // }

    getArrDays = (language) => {
        let allDays = [];
        let currentDate = moment(new Date()).startOf('day');

        for (let i = 0; i < 7; i++) {
            let object = {};
            let loopDate = moment(new Date()).add(i, 'days').startOf('day');
            let dateFormatted = loopDate.format('DD/MM');

            if (language === LANGUAGES.VI) {
                let dayLabel = '';
                if (loopDate.isSame(currentDate, 'day')) {
                    dayLabel = 'Hôm nay';
                } else if (loopDate.isSame(currentDate.clone().add(1, 'days'), 'day')) {
                    dayLabel = 'Ngày mai';
                } else {
                    dayLabel = loopDate.format('dddd'); // Thứ Hai, Thứ Ba, ...
                    dayLabel = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1); // Viết hoa chữ cái đầu
                }

                object.label = `${dayLabel} - ${dateFormatted}`;
            } else {
                let dayLabel = '';
                if (loopDate.isSame(currentDate, 'day')) {
                    dayLabel = 'Today';
                } else if (loopDate.isSame(currentDate.clone().add(1, 'days'), 'day')) {
                    dayLabel = 'Tomorrow';
                } else {
                    dayLabel = loopDate.locale('en').format('ddd'); // Mon, Tue, ...
                }

                object.label = `${dayLabel} - ${dateFormatted}`;
            }

            object.value = loopDate.valueOf();
            allDays.push(object);
        }

        // console.log('allDays: ', allDays);
        return allDays;
    };


    async componentDidMount() {
        let { language } = this.props;
        // console.log('moment vi: ', moment(new Date()).format('dddd - DD/MM'));
        // console.log('moment en: ', moment(new Date()).locale('en').format('ddd - DD/MM'));
        let allDays = this.getArrDays(language);
        if (this.props.doctorIdFromParent) {
            let res = await getScheduleDoctorByDate(this.props.doctorIdFromParent, allDays[0].value);
            this.setState({
                allAvailableTime: res.data ? res.data : []
            })
        }
        this.setState({
            allDays: allDays,
        })

    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.language !== prevProps.language) {
            let allDays = this.getArrDays(this.props.language);
            this.setState({
                allDays: allDays
            })
        }
        if (this.props.doctorIdFromParent !== prevProps.doctorIdFromParent) {
            let allDays = this.getArrDays(this.props.language);
            let res = await getScheduleDoctorByDate(this.props.doctorIdFromParent, allDays[0].value);
            this.setState({
                allAvailableTime: res.data ? res.data : []
            })
        }
    }

    handleOnChangeSelect = async (event) => {
        if (this.props.doctorIdFromParent && this.props.doctorIdFromParent !== -1) {
            let doctorId = this.props.doctorIdFromParent;
            let date = event.target.value;
            let res = await getScheduleDoctorByDate(doctorId, date);

            if (res && res.errCode === 0) {
                this.setState({
                    allAvailableTime: res.data ? res.data : []
                })
            }

            console.log('check res schedule from react: ', res);

        }
        // console.log('event onChange date value: ', event.target.value);
    }

    handleClickScheduleTime = (time) => {
        // console.log('check time: ', time)
        this.setState({
            isOpenModalBooking: true,
            dataScheduleTimeModal: time
        })
    }

    closeBookingModal = () => {
        this.setState({
            isOpenModalBooking: false,
        })
    }

    render() {
        let { allDays, allAvailableTime, isOpenModalBooking, dataScheduleTimeModal } = this.state;
        let { language } = this.props;
        return (
            <>
                <div className='doctor-schedule-container'>
                    <div className='all-schedule'>
                        <select onChange={(event) => this.handleOnChangeSelect(event)}>
                            {allDays && allDays.length > 0 &&
                                allDays.map((item, index) => {
                                    return (
                                        <option key={index} value={item.value}>{item.label}</option>
                                    )
                                })
                            }

                        </select>
                    </div>
                    {/* ================= */}
                    <div className='all-available-time'>
                        <div className='text-calendar'>
                            <i className="far fa-calendar-alt">
                                <span><FormattedMessage id="patient.detail-doctor.schedule" /></span>
                            </i>
                        </div>
                        <div className='time-content'>
                            {allAvailableTime && allAvailableTime.length > 0 ?
                                <React.Fragment>
                                    <div className='time-content-btns'>
                                        {allAvailableTime.map((item, index) => {
                                            let timeDisplay = language === LANGUAGES.VI ? item.timeTypeData.valueVi : item.timeTypeData.valueEn;
                                            return (
                                                <button key={index} className={language === LANGUAGES.VI ? 'btn-vie' : 'btn-en'}
                                                    onClick={() => this.handleClickScheduleTime(item)}
                                                >
                                                    {timeDisplay}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    <div className='book-free'>
                                        <span>
                                            <FormattedMessage id="patient.detail-doctor.choose" />
                                            <i className='far fa-hand-point-up'></i>
                                            <FormattedMessage id="patient.detail-doctor.book-free" />
                                        </span>
                                    </div>
                                </React.Fragment>
                                :
                                <div className='no-schedule'><FormattedMessage id="patient.detail-doctor.no-schedule" /></div>
                            }
                        </div>
                    </div>
                </div>

                {/* ============ Booking Modal ========= */}
                <BookingModal
                    isOpenModal={isOpenModalBooking}
                    closeBookingModal={this.closeBookingModal}
                    dataTime={dataScheduleTimeModal}
                />
            </>
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

export default connect(mapStateToProps, mapDispatchToProps)(DoctorSchedule);
