import React, { Component } from "react";
import { connect } from "react-redux";
import "./RemedyModal.scss";
import { FormattedMessage } from "react-intl";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { toast } from "react-toastify";
import moment from "moment";
import { CommonUtils } from "../../../utils";

class RemedyModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      file: null,
      fileName: "",
      imgPreview: "",
      isImage: false,
    };
  }

  async componentDidMount() {
    if (this.props.dataModal) {
      this.setState({
        email: this.props.dataModal.email || "",
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.dataModal !== this.props.dataModal) {
      this.setState({
        email: this.props.dataModal.email || "",
        file: null,
        fileName: "",
        imgPreview: "",
        isImage: false,
      });
    }
  }

  handleOnChangeEmail = (e) => {
    this.setState({ email: e.target.value });
  };

  handleOnChangeFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name;
    const fileType = file.type;

    // Kiểm tra định dạng file hợp lệ
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
    ];
    const validPdfType = "application/pdf";

    let isImage = false;
    let imgPreview = "";

    if (validImageTypes.includes(fileType)) {
      isImage = true;
      imgPreview = URL.createObjectURL(file);
    } else if (fileType === validPdfType) {
      isImage = false;
      imgPreview = "/path-to-pdf-icon.png";
    } else {
      toast.error("Chỉ hỗ trợ file ảnh (JPG, PNG) hoặc PDF!");
      return;
    }

    this.setState({
      file,
      fileName,
      imgPreview,
      isImage,
    });
  };

  handleSendRemedy = async () => {
    const { email, file } = this.state;

    if (!email) {
      toast.error("Vui lòng nhập email bệnh nhân!");
      return;
    }

    if (!file) {
      toast.error("Vui lòng chọn file đơn thuốc!");
      return;
    }

    // Chuẩn bị dữ liệu gửi lên server
    let data = {
      email: email.trim(),
      fileName: this.state.fileName,
      imgBase64: await CommonUtils.getBase64(file), // Chuyển file thành base64
    };

    // Gọi hàm từ parent
    this.props.sendRemedy(data);
  };

  render() {
    const { isOpenModal, closeRemedyModal } = this.props;
    const { email, fileName, imgPreview, isImage } = this.state;

    return (
      <Modal
        isOpen={isOpenModal}
        className="booking-modal-container"
        size="lg"
        centered
      >
        <ModalHeader>Gửi hóa đơn & đơn thuốc</ModalHeader>

        <ModalBody style={{ minHeight: "70vh" }}>
          <div className="row">
            {/* Email */}
            <div className="col-6 form-group">
              <label>
                <FormattedMessage id="patient.booking-modal.email" />
              </label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={this.handleOnChangeEmail}
                placeholder="nhập email bệnh nhân..."
              />
            </div>

            {/* File Upload */}
            <div className="col-6 form-group">
              <label>Chọn file (PDF hoặc ảnh)</label>
              <input
                type="file"
                className="form-control-file"
                accept=".pdf,image/*"
                onChange={this.handleOnChangeFile}
              />
              {fileName && (
                <small className="text-success d-block mt-1">
                  Đã chọn: <strong>{fileName}</strong>
                </small>
              )}
            </div>
          </div>

          {/* Preview */}
          {imgPreview && (
            <div className="row mt-3">
              <div className="col-12">
                <label>Preview:</label>
                <div
                  className="preview-container"
                  style={{
                    maxHeight: "300px",
                    overflow: "auto",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "10px",
                    background: "#f9f9f9",
                  }}
                >
                  {isImage ? (
                    <img
                      src={imgPreview}
                      alt="Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "280px",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <i className="fas fa-file-pdf fa-5x text-danger"></i>
                      <p className="mt-2">File PDF: {fileName}</p>
                      {/* <small className="text-muted">
                        (Không thể hiển thị preview PDF)
                      </small> */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <span></span>
          <Button
            color="primary"
            onClick={this.handleSendRemedy}
            disabled={!fileName}
          >
            Gửi
          </Button>
          <Button color="secondary" onClick={closeRemedyModal}>
            Hủy
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(RemedyModal);
