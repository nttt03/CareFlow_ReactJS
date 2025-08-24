import React, { Component } from 'react';
import { connect } from "react-redux";
import './RemedyModal.scss';
import { FormattedMessage } from 'react-intl';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { toast } from 'react-toastify';
import moment from 'moment';
import { CommonUtils } from '../../../utils';

class RemedyModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            imgBase64: '',
        }

    }

    async componentDidMount() {
        if (this.props.dataModal) {
            this.setState({
                email: this.props.dataModal.email,
            })
        }

    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.dataModal !== this.props.dataModal) {
            this.setState({
                email: this.props.dataModal.email,
            })
        }
    }

    handleOnchangeEmail = (event) => {
        this.setState({
            email: event.target.value
        })
    }

    handleOnChangeImage = async (event) => {
        let data = event.target.files;
        let file = data[0];
        if (file) {
            let base64 = await CommonUtils.getBase64(file);
            this.setState({
                imgBase64: base64
            })
        }

    }

    handleSendRemedy = () => {
        this.props.sendRemedy(this.state)
    }

    render() {

        let { isOpenModal, closeRemedyModal, sendRemedy, dataModal } = this.props;

        return (
            <Modal isOpen={isOpenModal} className={'booking-modal-container'}
                size='mg' centered
            >
                <div className='modal-header'>
                    <h5 className='modal-title'>Gửi hóa đơn</h5>
                    <button type="button" className="close" aria-label='Close' onClick={closeRemedyModal}>
                        <span aria-hidden="true">x</span>
                    </button>
                </div>
                <ModalBody>
                    <div className='row'>
                        <div className='col-6 form-group'>
                            <label>Email bệnh nhân</label>
                            <input type="email" className="form-control" value={this.state.email}
                                onChange={(e) => this.handleOnchangeEmail(e)}
                            />
                        </div>
                        <div className='col-6 form-group'>
                            <label>Chọn đơn thuốc</label>
                            <input type="file" className="form-control-file"
                                onChange={(e) => this.handleOnChangeImage(e)}
                            />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={() => this.handleSendRemedy()}>Send</Button>
                    <Button className="secondary" onClick={closeRemedyModal}>Cancel</Button>

                </ModalFooter>
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        genders: state.admin.genders
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(RemedyModal);
