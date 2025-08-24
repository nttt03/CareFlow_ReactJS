import React, { Component } from 'react';
import { connect } from 'react-redux';
import './HomeFooter.scss';
import { FormattedMessage } from 'react-intl';

class HomeFooter extends Component {

    render() {
        return (
            <footer className='home-footer'>
                <div className='footer-container'>
                    {/* Company Section */}
                    <div className='footer-section'>
                        <h3><FormattedMessage id="homefooter.company" /></h3>
                        <p><FormattedMessage id="homefooter.address" /></p>
                        <p><FormattedMessage id="homefooter.phone" /></p>
                        <p><FormattedMessage id="homefooter.email" /></p>
                    </div>

                    {/* Policy Section */}
                    <div className='footer-section'>
                        <h3><FormattedMessage id="homefooter.policy" /></h3>
                        <ul>
                            <li><a href="#"><FormattedMessage id="homefooter.policy_contact" /></a></li>
                            <li><a href="#"><FormattedMessage id="homefooter.policy_digital" /></a></li>
                            <li><a href="#"><FormattedMessage id="homefooter.policy_security" /></a></li>
                            <li><a href="#"><FormattedMessage id="homefooter.policy_terms" /></a></li>
                        </ul>
                    </div>

                    {/* Partners Section */}
                    <div className='footer-section'>
                        <h3><FormattedMessage id="homefooter.partner" /></h3>
                        <p><FormattedMessage id="homefooter.partner_1" /></p>
                        <p><FormattedMessage id="homefooter.partner_2" /></p>
                        <p><FormattedMessage id="homefooter.partner_3" /></p>
                    </div>

                    {/* Social Media Section */}
                    <div className='footer-section'>
                        <h3><FormattedMessage id="homefooter.connect" /></h3>
                        <div className='social-icons'>
                            <a href="#"><i className="fab fa-facebook"></i></a>
                            <a href="#"><i className="fab fa-instagram"></i></a>
                            <a href="#"><i className="fab fa-youtube"></i></a>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className='footer-bottom'>
                    <p>&copy; {new Date().getFullYear()} Care Flow. All rights reserved.</p>
                </div>
            </footer>
        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn
    };
};

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeFooter);
