import React, { Component } from 'react';
import { connect } from "react-redux";
import './ManageClinic.scss';
import markdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import { CommonUtils } from '../../../utils';
import { createNewClinic } from '../../../services/userService';
import { toast } from 'react-toastify';
import { FormattedMessage } from 'react-intl';

const mdParser = new markdownIt();

class ManageClinic extends Component {

    constructor(props) {
        super(props);
        this.state = {
            name: '',
            address: '',
            imageBase64: '',
            descriptionHTML: '',
            descriptionMarkdown: '',

        }

    }

    async componentDidMount() {

    }

    async componentDidUpdate(prevProps, prevState, snapshot) {

    }

    handleOnchangeInput = (event, id) => {
        let stateCopy = { ...this.state };
        stateCopy[id] = event.target.value;
        this.setState({
            ...stateCopy
        });
    }

    handleEditorChange = ({ html, text }) => {
        this.setState({
            descriptionMarkdown: text,
            descriptionHTML: html,
        })
    }

    handleOnChangeImage = async (event) => {
        let data = event.target.files;
        let file = data[0];
        if (file) {
            let base64 = await CommonUtils.getBase64(file);
            this.setState({
                imageBase64: base64
            })
        }

    }

    handleSaveClinic = async () => {
        let res = await createNewClinic(this.state);
        if (res && res.errCode === 0) {
            toast.success('Add new clinic successfully!');
            this.setState({
                name: '',
                address: '',
                imageBase64: '',
                descriptionHTML: '',
                descriptionMarkdown: '',
            })
        } else {
            toast.error('Failed to add new clinic!');
            console.log('check res-err: ', res);
        }
    }

    render() {
        return (
            <div>
                <div className='manage-spetialty-container'>
                    <div className='ms-title'><FormattedMessage id='admin.manage-clinic.title' /></div>

                    <div className='add-new-spectialty row'>
                        <div className='col-6'>
                            <label><FormattedMessage id='admin.manage-clinic.name-clinic' /></label>
                            <input className='form-control' type='text' value={this.state.name}
                                onChange={(e) => { this.handleOnchangeInput(e, 'name') }}
                            />
                        </div>
                        <div className='col-6'>
                            <label><FormattedMessage id='admin.manage-clinic.img-clinic' /></label>
                            <input className='form-control-file' type='file'
                                onChange={(e) => { this.handleOnChangeImage(e) }}
                            />
                        </div>
                        <div className='col-6 form-group'>
                            <label><FormattedMessage id='admin.manage-clinic.address' /></label>
                            <input className='form-control' type='text' value={this.state.address}
                                onChange={(e) => { this.handleOnchangeInput(e, 'address') }}
                            />
                        </div>
                        <div className='col-12 mt-3'>
                            <MdEditor
                                value={this.state.descriptionMarkdown}
                                style={{ height: '400px' }}
                                renderHTML={text => mdParser.render(text)}
                                onChange={this.handleEditorChange}
                            />
                        </div>
                        <div className='col-12'>
                            <button className='btn-save-specialty'
                                onClick={() => { this.handleSaveClinic() }}
                            ><FormattedMessage id='admin.manage-clinic.save' /></button>
                        </div>
                    </div>

                </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(ManageClinic);
