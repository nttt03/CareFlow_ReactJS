import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Slider.scss'
import Slider from 'react-slick';
import handBook from '../../../assets/Hand-book.png';
import { FormattedMessage } from 'react-intl';

class HandBook extends Component {

    render() {
        return (
            <div className='section-share section-handbook'>
                <div className='section-container'>

                    <div className='section-header'>
                        <span><FormattedMessage id="homepage.handbook" /></span>
                        <button className='btn btn-secondary px-3'><FormattedMessage id="homepage.more-infor" /></button>
                    </div>

                    <div className='section-body'>
                        <Slider {...this.props.settings}>
                            <div className='section-customize slider-child'>
                                <div className='customize-border-slider'>
                                    <img className='bg-image-slider' src={handBook} />
                                    <span>Cẩm nang 1</span>
                                </div>
                            </div>
                            <div className='section-customize slider-child'>
                                <div className='customize-border-slider'>
                                    <img className='bg-image-slider' src={handBook} />
                                    <span>Cẩm nang 2</span>
                                </div>
                            </div>
                            <div className='section-customize slider-child'>
                                <div className='customize-border-slider'>
                                    <img className='bg-image-slider' src={handBook} />
                                    <span>Cẩm nang 3</span>
                                </div>
                            </div>
                            <div className='section-customize slider-child'>
                                <div className='customize-border-slider'>
                                    <img className='bg-image-slider' src={handBook} />
                                    <span>Cẩm nang 4</span>
                                </div>
                            </div>
                            <div className='section-customize slider-child'>
                                <div className='customize-border-slider'>
                                    <img className='bg-image-slider' src={handBook} />
                                    <span>Cẩm nang 5</span>
                                </div>
                            </div>
                            <div className='section-customize slider-child'>
                                <div className='customize-border-slider'>
                                    <img className='bg-image-slider' src={handBook} />
                                    <span>Cẩm nang 6</span>
                                </div>
                            </div>
                        </Slider>
                    </div>

                </div>


            </div>
        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(HandBook);
