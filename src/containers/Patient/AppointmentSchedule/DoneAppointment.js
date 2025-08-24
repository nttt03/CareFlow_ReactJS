import React, { Component } from 'react';
import { connect } from "react-redux";
import { getDoneAppointment } from '../../../services/userService';
import HomeHeader from '../../HomePage/HomeHeader';
import HomeFooter from '../../HomePage/HomeFooter';
import { LANGUAGES } from '../../../utils';
import { FormattedMessage } from 'react-intl';
import './NewAppointment.scss';
import emptyImg from '../../../assets/empty.png';

class DoneAppointment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            doneAppointment: [],
            currentPatientId: -1
        }
    }

    async componentDidMount() {
        if (this.props.match && this.props.match.params && this.props.match.params.id) {
            let id = this.props.match.params.id;
            this.setState({
                currentPatientId: id
            });
            let res = await getDoneAppointment(id);
            if (res && res.errCode === 0) {
                this.setState({
                    doneAppointment: res.dataAppointments,
                });
            }
        }
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
    }

    handleViewNewAppointment = () => {
        if (this.props.history) {
            this.props.history.push(`/new-appointment`);
        }
    }

    formatDate = (timestamp) => {
        const date = new Date(parseInt(timestamp));
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    render() {
        let { doneAppointment } = this.state;
        console.log("doneAppointment: ", doneAppointment);
        let { language } = this.props;

        return (
            <React.Fragment>
                <HomeHeader />
                <div className='container'>
                    <div className='appointment-schedule-container'>
                        <div className='appointment-schedule-navigation'>
                            <button onClick={() => this.handleViewNewAppointment()} className='new-appointment actived'><FormattedMessage id="patient.appointment-patient.new-appointment" /></button>
                            <button className='old-appointment'><FormattedMessage id="patient.appointment-patient.done-appointment" /></button>
                        </div>

                        {doneAppointment && doneAppointment.length > 0 ? (
                            doneAppointment.map((item, index) => {
                                // Tính toán nameVi và nameEn cho từng item
                                let nameVi = '';
                                let nameEn = '';
                                if (item.infoDataDoctor && item.infoDataDoctor.positionData) {
                                    nameVi = `${item.infoDataDoctor.positionData.valueVi}, ${item.infoDataDoctor.lastName} ${item.infoDataDoctor.firstName}`;
                                    nameEn = `${item.infoDataDoctor.positionData.valueEn}, ${item.infoDataDoctor.firstName} ${item.infoDataDoctor.lastName}`;
                                }

                                return (
                                    <div key={index} className='appointment-schedule-content'>
                                        <div className='distance'></div>
                                        <div className='status status-done'>
                                            {language === LANGUAGES.VI ? item.statusData?.valueVi : item.statusData?.valueEn}
                                        </div>

                                        <div className='appointment-details'>
                                            <h4 className='title'><FormattedMessage id="patient.appointment-patient.title" /></h4>
                                            <div className='appointment-item'>
                                                <span className='label'><FormattedMessage id="patient.appointment-patient.date" /></span>
                                                <span className='value'>{this.formatDate(item.date)}</span>
                                            </div>
                                            <div className='appointment-item'>
                                                <span className='label'><FormattedMessage id="patient.appointment-patient.time" /></span>
                                                <span className='value'>
                                                    {language === LANGUAGES.VI ? item.timeTypeDataPatient?.valueVi : item.timeTypeDataPatient?.valueEn || '8:00 - 9:00'}
                                                </span>
                                            </div>
                                            <div className='appointment-item'>
                                                <span className='label'><FormattedMessage id="patient.appointment-patient.address" /></span>
                                                <span className='value'>{item.doctorInfoData?.addressClinic || '123 Đường Công Nghệ, Quận 1, TP. HCM'}</span>
                                            </div>
                                            <div className='appointment-item'>
                                                <span className='label'><FormattedMessage id="patient.appointment-patient.price" /></span>
                                                <span className='value'>
                                                    {item.doctorInfoData?.priceTypeData
                                                        ? `${language === LANGUAGES.VI ? item.doctorInfoData.priceTypeData.valueVi : item.doctorInfoData.priceTypeData.valueEn} ${language === LANGUAGES.VI ? 'VNĐ' : 'USD'}`
                                                        : '500.000 VNĐ'}
                                                </span>
                                            </div>
                                            <div className='appointment-item'>
                                                <span className='label'><FormattedMessage id="patient.appointment-patient.doctor" /></span>
                                                <span className='value'>
                                                    {language === LANGUAGES.VI ? nameVi : nameEn || 'TS. BS. Nguyễn Văn A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
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
                <HomeFooter />
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(DoneAppointment);