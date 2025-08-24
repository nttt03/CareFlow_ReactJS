import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import * as actions from "../../../store/actions";
import './ManageDoctor.scss';
import { CRUD_ACTIONS, LANGUAGES } from '../../../utils';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
// import style manually
import 'react-markdown-editor-lite/lib/index.css';
import Select from 'react-select';
import { getDetailInforDoctor } from '../../../services/userService';

// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */);

class ManageDoctor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            // save to Markdown table
            contentMarkdown: '',
            contentHTML: '',
            selectedOption: '',
            description: '',
            listDoctors: [],
            hasOlData: false,
            // save to doctor_infor table
            listPrice: [],
            listPayment: [],
            listProvince: [],
            listSpecialty: [],
            listClinic: [],

            selectedPrice: '',
            selectedPayment: '',
            selectedProvince: '',
            selectedClinic: '',
            selectedSpecialty: '',

            nameClinic: '',
            addressClinic: '',
            note: '',
            clinicId: '',
            specialtyId: '',

        }
    }

    componentDidMount() {
        this.props.fetchAllDoctorsRedux();
        this.props.getAllRequiredDoctorInfor()
    }

    buildDataInputSelect = (inputData, type) => {
        let result = [];
        let { language } = this.props;
        if (inputData && inputData.length > 0) {
            if (type === 'USERS') {
                inputData.map((item, index) => {
                    let object = {};
                    let labelVi = `${item.lastName} ${item.firstName}`;
                    let labelEn = `${item.firstName} ${item.lastName}`;
                    object.label = language === LANGUAGES.VI ? labelVi : labelEn;
                    object.value = item.id;
                    result.push(object);
                })
            }
            if (type === 'PRICE') {
                // console.log('>>> check input data: ', inputData);
                inputData.map((item, index) => {
                    let object = {};
                    let labelVi = `${item.valueVi}`;
                    let labelEn = `${item.valueEn} USD`;
                    object.label = language === LANGUAGES.VI ? labelVi : labelEn;
                    object.value = item.keyMap;
                    result.push(object);
                })
            }
            if (type === 'PAYMENT' || type === 'PROVINCE') {
                // console.log('>>> check input data: ', inputData);
                inputData.map((item, index) => {
                    let object = {};
                    let labelVi = `${item.valueVi}`;
                    let labelEn = `${item.valueEn}`;
                    object.label = language === LANGUAGES.VI ? labelVi : labelEn;
                    object.value = item.keyMap;
                    result.push(object);
                })
            }
            if (type === 'SPECIALTY') {
                inputData.map((item, index) => {
                    let object = {};
                    object.label = item.name
                    object.value = item.id;
                    result.push(object);
                })
            }
            if (type === 'CLINIC') {
                inputData.map((item, index) => {
                    let object = {};
                    object.label = item.name
                    object.value = item.id;
                    result.push(object);
                })
            }

        }
        return result;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.allDoctors !== this.props.allDoctors) {
            let dataSelect = this.buildDataInputSelect(this.props.allDoctors, 'USERS')
            this.setState({
                listDoctors: dataSelect
            })
        }

        if (prevProps.allRequiredDoctorInfor !== this.props.allRequiredDoctorInfor) {
            // console.log('>>> get data from redux: ', this.props.allRequiredDoctorInfor);
            let { resPayment, resPrice, resProvince, resSpecialty, resClinic } = this.props.allRequiredDoctorInfor;
            let dataSelectPrice = this.buildDataInputSelect(resPrice, 'PRICE');
            let dataSelectPayment = this.buildDataInputSelect(resPayment, 'PAYMENT');
            let dataSelectProvince = this.buildDataInputSelect(resProvince, 'PROVINCE');
            let dataSelectSpecialty = this.buildDataInputSelect(resSpecialty, 'SPECIALTY');
            let dataSelectClinic = this.buildDataInputSelect(resClinic, 'CLINIC');
            // console.log('>>> data new: ', dataSelectPrice, dataSelectPayment, dataSelectProvince);
            this.setState({
                listPrice: dataSelectPrice,
                listPayment: dataSelectPayment,
                listProvince: dataSelectProvince,
                listSpecialty: dataSelectSpecialty,
                listClinic: dataSelectClinic
            })
        }

        // khi thay đổi ngôn ngữ cần buid lại dữ liệu
        if (prevProps.language !== this.props.language) {
            let dataSelect = this.buildDataInputSelect(this.props.allDoctors, 'USERS');
            let { resPayment, resPrice, resProvince } = this.props.allRequiredDoctorInfor;
            let dataSelectPrice = this.buildDataInputSelect(resPrice, 'PRICE');
            let dataSelectPayment = this.buildDataInputSelect(resPayment, 'PAYMENT');
            let dataSelectProvince = this.buildDataInputSelect(resProvince, 'PROVINCE');

            this.setState({
                listDoctors: dataSelect,
                listPrice: dataSelectPrice,
                listPayment: dataSelectPayment,
                listProvince: dataSelectProvince
            })
        }
    }

    handleEditorChange = ({ html, text }) => {
        this.setState({
            contentMarkdown: text,
            contentHTML: html,
        })
    }

    handleSaveContentMarkdown = () => {
        let { hasOlData } = this.state;
        this.props.saveDetailDoctor({
            // các trường lưu trong bảng Mardown
            contentHTML: this.state.contentHTML,
            contentMarkdown: this.state.contentMarkdown,
            description: this.state.description,
            doctorId: this.state.selectedOption.value,
            action: hasOlData === true ? CRUD_ACTIONS.EDIT : CRUD_ACTIONS.CREATE,

            // các trường lưu trong bảng Doctor_infor
            selectedPrice: this.state.selectedPrice.value,
            selectedPayment: this.state.selectedPayment.value,
            selectedProvince: this.state.selectedProvince.value,
            nameClinic: this.state.nameClinic,
            addressClinic: this.state.addressClinic,
            note: this.state.note,
            specialtyId: this.state.selectedSpecialty.value,
            clinicId: this.state.selectedClinic && this.state.selectedClinic.value ? this.state.selectedClinic.value : '',
        })
        console.log('handleSaveContentMarkdown state', this.state);
    }



    handleChangeSelect = async (selectedOption) => {
        this.setState({ selectedOption });
        let { listPrice, listPayment, listProvince, listSpecialty, listClinic } = this.state;
        let res = await getDetailInforDoctor(selectedOption.value);
        // console.log("API Response:", res);
        if (res && res.errCode === 0 && res.data && res.data.Markdown) {
            let markdown = res.data.Markdown;

            let addressClinic = '', nameClinic = '', note = '', paymentId = '', priceId = '', provinceId = '', specialtyId = '', clinicId = '',
                selectedPrice = '', selectedPayment = '', selectedProvince = '', selectedSpecialty = '', selectedClinic = '';

            if (res.data.Doctor_Infor) {
                addressClinic = res.data.Doctor_Infor.addressClinic;
                nameClinic = res.data.Doctor_Infor.nameClinic;
                note = res.data.Doctor_Infor.note;

                paymentId = res.data.Doctor_Infor.paymentId;
                priceId = res.data.Doctor_Infor.priceId;
                provinceId = res.data.Doctor_Infor.provinceId;
                specialtyId = res.data.Doctor_Infor.specialtyId;
                clinicId = res.data.Doctor_Infor.clinicId;

                selectedPayment = listPayment.find(item => {
                    if (item.value === paymentId) return item;
                })
                selectedPrice = listPrice.find(item => {
                    if (item.value === priceId) return item;
                })
                selectedProvince = listProvince.find(item => {
                    // cách viết khác
                    return item && item.value === provinceId;
                })
                selectedSpecialty = listSpecialty.find(item => {
                    return item && item.value === specialtyId;
                })
                selectedClinic = listClinic.find(item => {
                    return item && item.value === clinicId;
                })

                // console.log('check findItem', selectedPayment, listPayment);

            }

            this.setState({
                contentHTML: markdown.contentHTML,
                contentMarkdown: markdown.contentMarkdown,
                description: markdown.description,
                hasOlData: true,
                addressClinic: addressClinic,
                nameClinic: nameClinic,
                note: note,
                selectedPrice: selectedPrice,
                selectedPayment: selectedPayment,
                selectedProvince: selectedProvince,
                selectedSpecialty: selectedSpecialty,
                selectedClinic: selectedClinic,
            })

        } else {
            this.setState({
                contentHTML: '',
                contentMarkdown: '',
                description: '',
                hasOlData: false,
                addressClinic: '',
                nameClinic: '',
                note: '',
                selectedPrice: '',
                selectedPayment: '',
                selectedProvince: '',
                selectedSpecialty: '',
                selectedClinic: '',
            })
        }
        console.log(`Option selected res:`, res)
        // console.log(`Option selectedOption:`, selectedOption)
    };
    // tối ưu code chỉ cần viết 1 hàm handleChangeSelectDoctorInfor để change select infor trong thẻ select
    // thay vì viết 3 hàm để change select từng cái selectedPrice / selectedPayment / selectedProvince
    handleChangeSelectDoctorInfor = async (selectedOption, name) => {
        // hai biến selectedOption, name là do thư viện trả về 
        console.log('>>> check new select onchange: ', selectedOption, name);
        let stateName = name.name; // selectedPrice / selectedPayment / selectedProvince
        let stateCopy = { ...this.state };
        stateCopy[stateName] = selectedOption;
        this.setState({
            ...stateCopy
        })

    }

    handleOnChangeText = (event, id) => {
        let stateCopy = { ...this.state };
        stateCopy[id] = event.target.value;
        this.setState({
            ...stateCopy
        })
    }

    render() {
        console.log('check state: ', this.state);
        let { hasOlData, listSpecialtyS } = this.state;
        return (
            <div className='manage-doctor-container'>
                <div className='manage-doctor-title'>
                    <FormattedMessage id="admin.manage-doctor.title" />
                </div>
                <div className='more-infor'>
                    <div className='content-left form-group'>
                        <label><FormattedMessage id="admin.manage-doctor.choose-doctor" /></label>
                        <Select
                            placeholder={<FormattedMessage id="admin.manage-doctor.choose-doctor-placeholder" />}
                            value={this.state.selectedOption}
                            onChange={this.handleChangeSelect}
                            options={this.state.listDoctors}
                        />
                    </div>
                    <div className='content-right form-group'>
                        <label><FormattedMessage id="admin.manage-doctor.intro" /></label>
                        <textarea className='form-control'
                            onChange={(e) => this.handleOnChangeText(e, 'description')}
                            value={this.state.description}
                        >
                        </textarea>
                    </div>
                </div>
                <div className='more-infor-extra row'>
                    <div className='col-4 form-group'>
                        <label><FormattedMessage id="admin.manage-doctor.price" /></label>
                        <Select
                            placeholder={<FormattedMessage id="admin.manage-doctor.choose-doctor-placeholder" />}
                            value={this.state.selectedPrice}
                            onChange={this.handleChangeSelectDoctorInfor}
                            options={this.state.listPrice}
                            name='selectedPrice'
                        />
                    </div>
                    <div className='col-4 form-group'>
                        <label><FormattedMessage id="admin.manage-doctor.payment" /></label>
                        <Select
                            placeholder={<FormattedMessage id="admin.manage-doctor.choose-doctor-placeholder" />}
                            value={this.state.selectedPayment}
                            onChange={this.handleChangeSelectDoctorInfor}
                            options={this.state.listPayment}
                            name='selectedPayment'
                        />
                    </div>
                    <div className='col-4 form-group'>
                        <label><FormattedMessage id="admin.manage-doctor.province" /></label>
                        <Select
                            placeholder={<FormattedMessage id="admin.manage-doctor.choose-doctor-placeholder" />}
                            value={this.state.selectedProvince}
                            onChange={this.handleChangeSelectDoctorInfor}
                            options={this.state.listProvince}
                            name='selectedProvince'
                        />
                    </div>
                    <div className='col-4 form-group'>
                        <label><FormattedMessage id="admin.manage-doctor.clinic-name" /></label>
                        <input className='form-control'
                            onChange={(e) => this.handleOnChangeText(e, 'nameClinic')}
                            value={this.state.nameClinic}
                        />
                    </div>
                    <div className='col-4 form-group'>
                        <label><FormattedMessage id="admin.manage-doctor.clinic-address" /></label>
                        <input className='form-control'
                            onChange={(e) => this.handleOnChangeText(e, 'addressClinic')}
                            value={this.state.addressClinic}
                        />
                    </div>
                    <div className='col-4 form-group'>
                        <label><FormattedMessage id="admin.manage-doctor.note" /></label>
                        <input className='form-control'
                            onChange={(e) => this.handleOnChangeText(e, 'note')}
                            value={this.state.note}
                        />
                    </div>
                </div>
                <div className='row'>
                    <div className='col-4 form-group'>
                        <label><FormattedMessage id="admin.manage-doctor.specialty" /></label>
                        <Select
                            placeholder={<FormattedMessage id="admin.manage-doctor.choose-doctor-placeholder" />}
                            value={this.state.selectedSpecialty}
                            onChange={this.handleChangeSelectDoctorInfor}
                            name="selectedSpecialty"
                            options={this.state.listSpecialty}
                        />
                    </div>
                    <div className='col-4 form-group'>
                        <label><FormattedMessage id="admin.manage-doctor.clinic" /></label>
                        <Select
                            placeholder={<FormattedMessage id="admin.manage-doctor.choose-doctor-placeholder" />}
                            value={this.state.selectedClinic}
                            onChange={this.handleChangeSelectDoctorInfor}
                            name="selectedClinic"
                            options={this.state.listClinic}
                        />
                    </div>
                </div>
                <div className='manage-doctor-editor'>
                    <MdEditor
                        value={this.state.contentMarkdown}
                        style={{ height: '300px' }}
                        renderHTML={text => mdParser.render(text)}
                        onChange={this.handleEditorChange} />
                </div>
                <button className={hasOlData === true ? 'save-content-doctor' : 'create-content-doctor'}
                    onClick={() => this.handleSaveContentMarkdown()}
                >{hasOlData === true ?
                    <span><FormattedMessage id="admin.manage-doctor.save" /></span> :
                    <span><FormattedMessage id="admin.manage-doctor.add" /></span>
                    }
                </button>
            </div>
        );
    }

}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        // lấy từ trong state redux của adminReducer
        allDoctors: state.admin.allDoctors,
        allRequiredDoctorInfor: state.admin.allRequiredDoctorInfor,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchAllDoctorsRedux: () => dispatch(actions.fetchAllDoctors()),
        getAllRequiredDoctorInfor: () => dispatch(actions.getRequiredDoctorInfor()),
        saveDetailDoctor: (data) => dispatch(actions.saveDetailDoctor(data)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageDoctor);
