import React, { Component } from 'react';
import { connect } from "react-redux";
import './ListDoctor.scss';
import HomeHeader from '../../HomePage/HomeHeader';
import HomeFooter from '../../HomePage/HomeFooter';
import * as actions from '../../../store/actions';
import { LANGUAGES } from '../../../utils';
import { FormattedMessage } from 'react-intl';

class ListDoctor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            arrDoctors: []
        };
    }

    async componentDidMount() {
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
        if (this.props.history) {
            this.props.history.push(`/detail-doctor/${doctor.id}`)
        }
    }

    render() {
        let arrDoctors = this.state.arrDoctors;
        const { language } = this.props;
        return (
            <React.Fragment>
                <HomeHeader />
                <div className="list-doctor-container">
                    <div className="list-doctor-content">
                        <h2 className="section-title"><FormattedMessage id='homeheader.list-doctor' /></h2>
                        {arrDoctors && arrDoctors.length > 0 ? (
                            arrDoctors.map((item, index) => {
                                let imageBase64 = '';
                                if (item.image) {
                                    imageBase64 = Buffer.from(item.image, 'base64').toString('binary');
                                }

                                let nameVi = `${item.positionData.valueVi}, ${item.lastName} ${item.firstName}`;
                                let nameEn = `${item.positionData.valueEn}, ${item.firstName} ${item.lastName}`;

                                // Kiểm tra và hiển thị tên chuyên khoa, nếu không có thì hiển thị "Chưa xác định"
                                const specialtyName = item.Doctor_Infor && item.Doctor_Infor.Specialty && item.Doctor_Infor.Specialty.name
                                    ? item.Doctor_Infor.Specialty.name
                                    : "Chưa xác định";

                                return (
                                    <div
                                        className="doctor-item"
                                        key={index}
                                        onClick={() => this.handleViewDetailDoctor(item)}
                                    >
                                        <div
                                            className="doctor-image"
                                            style={{
                                                backgroundImage: `url(${imageBase64 || ''})`,
                                            }}
                                        ></div>
                                        <div className="doctor-info">
                                            <div className="doctor-name">
                                                {language === LANGUAGES.VI ? nameVi : nameEn}
                                            </div>
                                            <div className="doctor-specialty">
                                                {specialtyName}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p>Không có bác sĩ nào để hiển thị.</p>
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
        topDoctorsRedux: state.admin.topDoctors,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        loadTopDoctors: () => dispatch(actions.fetchTopDoctor())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ListDoctor);
