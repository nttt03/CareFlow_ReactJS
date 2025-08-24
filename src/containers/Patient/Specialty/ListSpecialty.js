import React, { Component } from 'react';
import { connect } from "react-redux";
import './ListSpecialty.scss';
import HomeHeader from '../../HomePage/HomeHeader';
import HomeFooter from '../../HomePage/HomeFooter';
import { getAllSpecialty } from '../../../services/userService';
import { FormattedMessage } from 'react-intl';

class ListSpecialty extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSpecialty: []
        };
    }

    async componentDidMount() {
        const res = await getAllSpecialty();
        console.log('check getAllSpecialty: ', res);
        if (res && res.errCode === 0) {
            this.setState({
                dataSpecialty: res.data ? res.data : []
            });
        }
    }

    handleViewDetailSpecialty = (item) => {
        if (this.props.history) {
            this.props.history.push(`/detail-specialty/${item.id}`)
        }
    }

    render() {
        let { dataSpecialty } = this.state;

        return (
            <React.Fragment>
                <HomeHeader />
                <div className="list-specialty">
                    <div className="container">
                        <h2 className="list-specialty__title"><FormattedMessage id='homeheader.list-specialty' /></h2>
                        <div className="row">
                            {dataSpecialty && dataSpecialty.length > 0 &&
                                dataSpecialty.map((item, index) => {
                                    return (
                                        <div key={index} className="col-md-3 col-sm-6 col-12"
                                            onClick={() => this.handleViewDetailSpecialty(item)}
                                        >
                                            <div className="list-specialty__content">
                                                <div className="list-specialty__content__item">
                                                    <div className="list-specialty__content__item__image">
                                                        <img src={item.image} />
                                                    </div>
                                                    <div className="list-specialty__content__item__info">
                                                        <div className="list-specialty__content__item__info__name">
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

export default connect(mapStateToProps)(ListSpecialty);
