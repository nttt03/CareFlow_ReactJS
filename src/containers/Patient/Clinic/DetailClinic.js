import React, { Component } from 'react';
import { connect } from "react-redux";
import './DetailClinic.scss';
import { LANGUAGES } from '../../../utils';
import HomeHeader from '../../HomePage/HomeHeader';
import HomeFooter from '../../HomePage/HomeFooter';
import DoctorSchedule from '../Doctor/DoctorSchedule';
import DoctorExtraInfor from '../Doctor/DoctorExtraInfor';
import ProfileDoctor from '../Doctor/ProfileDoctor';
import { getAllDetailClinicById, getAllCodeService } from '../../../services/userService';
import _ from 'lodash';

class DetailClinic extends Component {

    constructor(props) {
        super(props);
        this.state = {
            arrDoctorId: [],
            dataDetailClinic: {},
        }

    }

    async componentDidMount() {
        if (this.props.match && this.props.match.params && this.props.match.params.id) {
            let id = this.props.match.params.id;

            let res = await getAllDetailClinicById({
                id: id,
            });

            if (res && res.errCode === 0) {
                let data = res.data;
                let arrDoctorId = [];
                if (data && !_.isEmpty(res.data)) {
                    let arr = data.doctorClinic;
                    if (arr && arr.length > 0) {
                        arr.map(item => {
                            arrDoctorId.push(item.doctorId)
                        })
                    }
                }

                this.setState({
                    dataDetailClinic: res.data,
                    arrDoctorId: arrDoctorId,
                })
            }
            // console.log('check res getDetailInfoDoctorByID: res', res)
        }
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {


    }

    render() {
        let { arrDoctorId, dataDetailClinic } = this.state;
        let { language } = this.props;
        // console.log('check state DetailClinic: ', this.state)
        return (
            <div className='detail-specialty-container'>
                <HomeHeader />
                <div className='detail-specialty-body'>
                    <div className='description-specialty'>
                        {dataDetailClinic && !_.isEmpty(dataDetailClinic) &&
                            <>
                                <h1 className='py-3 title'>{dataDetailClinic.name}</h1>
                                <div dangerouslySetInnerHTML={{ __html: dataDetailClinic.descriptionHTML }}></div>
                            </>
                        }
                    </div>

                    <div className='list-doctor'>
                        {arrDoctorId && arrDoctorId.length > 0 &&
                            arrDoctorId.map((item, index) => {
                                return (
                                    <div className='each-doctor' key={index}>
                                        <div className='detail-content-left'>
                                            <div className='profile-doctor'>
                                                <ProfileDoctor
                                                    doctorId={item}
                                                    isShowDescriptionDoctor={true}
                                                    isShowLinkDetail={true}
                                                    isShowPrice={false}
                                                />
                                            </div>
                                        </div>
                                        <div className='detail-content-right'>
                                            <div className='doctor-schedule'>
                                                <DoctorSchedule doctorIdFromParent={item} />
                                            </div>
                                            <div className='doctor-extra-infor'>
                                                <DoctorExtraInfor doctorIdFromParent={item} />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <HomeFooter />
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailClinic);
