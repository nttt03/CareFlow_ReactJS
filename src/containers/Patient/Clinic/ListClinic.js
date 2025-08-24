import React, { Component } from 'react';
import { connect } from "react-redux";
import './ListClinic.scss';
import HomeHeader from '../../HomePage/HomeHeader';
import HomeFooter from '../../HomePage/HomeFooter';
import { getAllClinic } from '../../../services/userService';
import { FormattedMessage } from 'react-intl';

class ListClinic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataClinics: [],
        };
    }

    async componentDidMount() {
        let res = await getAllClinic();
        if (res && res.errCode === 0) {
            this.setState({
                dataClinics: res.data ? res.data : [],
            })
        }
        // console.log('check res clinic', res);
    }

    handleViewDetailClinic = (clinic) => {
        if (this.props.history) {
            this.props.history.push(`/detail-clinic/${clinic.id}`)
        }
    }

    render() {
        let { dataClinics } = this.state;
        return (
            <React.Fragment>
                <HomeHeader />
                <div className="list-clinic">
                    <div className="container">
                        <h2 className="list-clinic__title"><FormattedMessage id='homeheader.list-clinic' /></h2>
                        <div className="row">
                            {dataClinics && dataClinics.length > 0 &&
                                dataClinics.map((item, index) => {
                                    return (
                                        <div key={index} className="col-md-3 col-sm-6 col-12"
                                            onClick={() => this.handleViewDetailClinic(item)}
                                        >
                                            <div className="list-clinic__content">
                                                <div className="list-clinic__content__item">
                                                    <div className="list-clinic__content__item__image">
                                                        <img src={item.image} />
                                                    </div>
                                                    <div className="list-clinic__content__item__info">
                                                        <div className="list-clinic__content__item__info__name">
                                                            {item.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
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
    };
};

export default connect(mapStateToProps)(ListClinic);
