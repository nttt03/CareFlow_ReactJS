import React, { Component } from 'react';
import { connect } from "react-redux";
import './NewAppointment.scss';
import HomeHeader from '../../HomePage/HomeHeader';
import HomeFooter from '../../HomePage/HomeFooter';
import { FormattedMessage } from 'react-intl';
import { getNewAppointment } from '../../../services/userService';
import emptyImg from '../../../assets/empty.png';

class NewAppointment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            newAppointment: [],
            isDataFetched: false,
        };
    }

    async componentDidMount() {
        let { userInfo } = this.props;
        console.log("UserInfo from props:", userInfo);
        if (userInfo && userInfo.id) {
            let data = await this.getNewAppointmentData(userInfo.id);
            this.setState({
                newAppointment: data,
                isDataFetched: true
            });
        } else {
            console.log("User information not available");
            this.setState({ isDataFetched: true });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.newAppointment.length === 0 && this.state.newAppointment.length > 0) {
            console.log("Dữ liệu lịch hẹn đã được cập nhật:", this.state.newAppointment);
        }
    }

    getNewAppointmentData = async (patientId) => {
        let dataNewAppointment = [];
        if (patientId) {
            let res = await getNewAppointment(patientId);
            if (res && res.errCode === 0) {
                dataNewAppointment = res.dataAppointments;
            }
        }
        return dataNewAppointment;
    }

    formatDate = (timestamp) => {
        const date = new Date(parseInt(timestamp));
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    handleViewDoneAppointment = () => {
        if (this.props.history) {
            const { userInfo } = this.props;
            if (userInfo && userInfo.id) {
                this.props.history.push(`/done-appointment/${userInfo.id}`);
            } else {
                alert("Bạn cần đăng nhập để xem lịch hẹn đã khám!");
            }
        }
    }

    render() {
        let { newAppointment } = this.state;
        const isVietnamese = this.props.language === 'vi';

        // Lấy timestamp của ngày hiện tại (00:00) một cách động
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Đặt về 00:00:00 của ngày hiện tại
        const currentTimestamp = currentDate.getTime();

        // Lọc các lịch hẹn từ ngày hiện tại trở đi
        const upcomingAppointments = newAppointment.filter(appointment =>
            parseInt(appointment.date) >= currentTimestamp
        );

        return (
            <React.Fragment>
                <HomeHeader />
                <div className='container'>
                    <div className='appointment-schedule-container'>
                        <div className='appointment-schedule-navigation'>
                            <button className='new-appointment actived'><FormattedMessage id="patient.appointment-patient.new-appointment" /></button>
                            <button className='old-appointment' onClick={() => this.handleViewDoneAppointment()}><FormattedMessage id="patient.appointment-patient.done-appointment" /></button>
                        </div>
                        <div className='appointment-schedule-content'>
                            {upcomingAppointments && upcomingAppointments.length > 0 ? (
                                upcomingAppointments.map((appointment, index) => (
                                    <div key={index}>
                                        <div className='distance'></div>
                                        <div className={`status ${appointment.statusId === 'S2' ? 'status-confirmed' : ''}`}>
                                            {isVietnamese ? appointment.statusData?.valueVi : appointment.statusData?.valueEn || 'N/A'}
                                        </div>
                                        <div className='appointment-details'>
                                            <h4 className='title'><FormattedMessage id="patient.appointment-patient.title" /></h4>
                                            <div className='appointment-item'>
                                                <span className='label'><FormattedMessage id="patient.appointment-patient.date" /></span>
                                                <span className='value'>{this.formatDate(appointment.date)}</span>
                                            </div>
                                            <div className='appointment-item'>
                                                <span className='label'><FormattedMessage id="patient.appointment-patient.time" /></span>
                                                <span className='value'>
                                                    {isVietnamese ? appointment.timeTypeDataPatient?.valueVi : appointment.timeTypeDataPatient?.valueEn || 'N/A'}
                                                </span>
                                            </div>
                                            <div className='appointment-item'>
                                                <span className='label'><FormattedMessage id="patient.appointment-patient.address" /></span>
                                                <span className='value'>{appointment.doctorInfoData?.addressClinic || 'N/A'}</span>
                                            </div>
                                            <div className='appointment-item'>
                                                <span className='label'><FormattedMessage id="patient.appointment-patient.price" /></span>
                                                <span className='value'>
                                                    {appointment.doctorInfoData?.priceTypeData
                                                        ? `${isVietnamese ? appointment.doctorInfoData.priceTypeData.valueVi : appointment.doctorInfoData.priceTypeData.valueEn} ${isVietnamese ? 'VNĐ' : 'USD'}`
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                            <div className='appointment-item'>
                                                <span className='label'><FormattedMessage id="patient.appointment-patient.doctor" /></span>
                                                <span className='value'>
                                                    {`${isVietnamese ? appointment.infoDataDoctor?.positionData?.valueVi : appointment.infoDataDoctor?.positionData?.valueEn || ''} ${appointment.infoDataDoctor?.firstName || ''} ${appointment.infoDataDoctor?.lastName || ''}`.trim() || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className='appointment-schedule-content'>
                                    <div className='title py-3'><FormattedMessage id="patient.appointment-patient.title-none" /></div>
                                    <div className='empty-image'>
                                        <img src={emptyImg} alt="empty" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <HomeFooter />
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        userInfo: state.user.userInfo
    };
};

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(NewAppointment);