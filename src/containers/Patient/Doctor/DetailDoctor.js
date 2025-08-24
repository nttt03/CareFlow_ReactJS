import React, { Component, Fragment } from 'react';
import { connect } from "react-redux";
import HomeHeader from '../../HomePage/HomeHeader';
import HomeFooter from '../../HomePage/HomeFooter';
import './DetailDoctor.scss';
import { getDetailInforDoctor } from '../../../services/userService';
import { LANGUAGES } from '../../../utils';
import DoctorSchedule from './DoctorSchedule';
import DoctorExtraInfor from './DoctorExtraInfor';
import LikeAndShare from '../SocialPlugin/LikeAndShare';
import Comment from '../SocialPlugin/Comment';

class DetailDoctor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            detailDoctor: {},
            currentDoctorId: -1
        }
    }

    async componentDidMount() {
        if (this.props.match && this.props.match.params && this.props.match.params.id) {
            let id = this.props.match.params.id;
            this.setState({
                currentDoctorId: id
            })
            let res = await getDetailInforDoctor(id);
            if (res && res.errCode === 0) {
                this.setState({
                    detailDoctor: res.data,
                })
            }
            // console.log('check res getDetailInfoDoctorByID: res', res)
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

    }

    render() {
        // console.log(this.props.match.params.id)
        // console.log('state: ', this.state)
        let { language } = this.props;
        let { detailDoctor } = this.state;
        let nameVi, nameEn = '';
        if (detailDoctor && detailDoctor.positionData) {
            nameVi = `${detailDoctor.positionData.valueVi}, ${detailDoctor.lastName} ${detailDoctor.firstName}`;
            nameEn = `${detailDoctor.positionData.valueEn}, ${detailDoctor.firstName} ${detailDoctor.lastName}`;
        }
        console.log('localhost: ', process.env.REACT_APP_IS_LOCALHOST)
        let currentURL = +process.env.REACT_APP_IS_LOCALHOST === 1 ?
            "https://github.com/nttt03" : window.location.href;
        return (
            <Fragment>
                <HomeHeader isShowBanner={false} />
                <div className='doctor-detail-container'>
                    <div className='intro-doctor'>
                        <div className='content-left' style={{ backgroundImage: `url(${detailDoctor && detailDoctor.image ? detailDoctor.image : ''})` }}>

                        </div>
                        <div className='content-right'>
                            <div className='up'>
                                {language === LANGUAGES.VI ? nameVi : nameEn}
                            </div>
                            <div className='down'>
                                {detailDoctor && detailDoctor.Markdown && detailDoctor.Markdown.description &&
                                    <span>
                                        {detailDoctor.Markdown.description}
                                    </span>
                                }
                                <div className='like-share-plugin'>
                                    <LikeAndShare dataHref={currentURL} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='schedule-doctor'>
                        <div className='content-left'>
                            <DoctorSchedule
                                // doctorIdFromParent={detailDoctor && detailDoctor.id ? detailDoctor.id : -1}
                                doctorIdFromParent={this.state.currentDoctorId}
                            />
                        </div>
                        <div className='content-right'>
                            <DoctorExtraInfor doctorIdFromParent={this.state.currentDoctorId} />
                        </div>
                    </div>
                    <div className='detail-intro-doctor'>
                        {detailDoctor && detailDoctor.Markdown && detailDoctor.Markdown.contentHTML &&
                            <div dangerouslySetInnerHTML={{ __html: detailDoctor.Markdown.contentHTML }}>

                            </div>
                        }
                    </div>
                    <div className='comment-doctor'>
                        <Comment
                            dataHref={currentURL}
                            width={"100%"}
                        />
                    </div>
                </div>
                <HomeFooter />
            </Fragment>
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailDoctor);
