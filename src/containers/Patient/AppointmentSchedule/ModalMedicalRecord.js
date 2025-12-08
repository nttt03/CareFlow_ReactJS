import React, { useState, useEffect, useCallback } from "react";
import { Drawer, Descriptions, Button, message, Divider } from "antd";
import { FormattedMessage, useIntl } from "react-intl";
// import "./ModalMedicalRecord.scss"; // Nếu bạn có file CSS riêng

// --- HÀM XỬ LÝ DỮ LIỆU TỆP ĐÍNH KÈM (BÊN NGOÀI COMPONENT) ---

/**
 * Chuyển đổi Buffer sang Base64 URL và xác định loại MIME.
 * @param {Object} fileBuffer - Dữ liệu file (Sequelize Buffer: { type: 'Buffer', data: [...] })
 * @returns {Object} { url, isDisplayable, mimeType }
 */
const getBase64Data = (fileBuffer) => {
    if (!fileBuffer || !fileBuffer.data || fileBuffer.data.length === 0) {
        return { url: null, isDisplayable: false, mimeType: null };
    }

    try {
        const array = new Uint8Array(fileBuffer.data);
        const binary = array.reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
        );
        const base64String = btoa(binary);

        let mimeType = "application/octet-stream";
        let isDisplayable = false;

        // Logic kiểm tra MIME type đơn giản (dựa trên header bytes)
        if (binary.substring(0, 4) === "%PDF") {
            mimeType = "application/pdf";
            isDisplayable = true;
        } else if (binary.substring(0, 4) === "\u0089PNG") {
            mimeType = "image/png";
            isDisplayable = true;
        } else if (binary.substring(0, 2) === "BM") {
            mimeType = "image/bmp";
            isDisplayable = true;
        } else if (binary.substring(0, 10).includes("JFIF") || binary.substring(0, 3) === "\u00FF\u00D8\u00FF") {
            mimeType = "image/jpeg";
            isDisplayable = true;
        }

        const url = `data:${mimeType};base64,${base64String}`;

        return { url, isDisplayable, mimeType };
    } catch (error) {
        console.error("Error converting buffer to Base64:", error);
        return { url: null, isDisplayable: false, mimeType: null };
    }
};

/**
 * Render trình xem file (Image hoặc PDF Viewer).
 */
const renderFileViewer = (url, mimeType) => {
    if (!url) return null;

    if (mimeType.startsWith("image/")) {
        return <img src={url} alt="Attached medical file" style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />;
    }

    if (mimeType === "application/pdf") {
        return (
            <iframe
                src={url}
                title="Medical Record PDF"
                width="100%"
                height="500px"
                style={{ border: '1px solid #ddd' }}
            />
        );
    }

    return (
        <p className="text-warning">
            <FormattedMessage
                id="patient.appointment-patient.cannot-display"
                defaultMessage="Không thể hiển thị trực tiếp. Vui lòng tải về."
            />
        </p>
    );
};

// --- COMPONENT CHÍNH (SỬ DỤNG HOOKS) ---

const ModalMedicalRecord = (props) => {
    const { isOpen, onClose, medicalRecordData, patientProfileData, language } = props;
    const isVietnamese = language === "vi";
    
    // State để điều khiển việc xem trước file
    const [showFilePreview, setShowFilePreview] = useState(false);

    // Xử lý dữ liệu đầu vào
    const { url, isDisplayable, mimeType } = getBase64Data(medicalRecordData?.file);
    const hasFile = !!url;
    const {
        height,
        weight,
        underlying_diseases,
        allergies,
        medical_history,
    } = patientProfileData || {};
    const description = medicalRecordData?.description;

    // Reset state khi Drawer mở
    useEffect(() => {
        if (isOpen) {
            setShowFilePreview(false);
        }
    }, [isOpen]);

    // Hàm xử lý tải về TỆP ĐÍNH KÈM
    const handleDownload = useCallback(() => {
        let fileExtension = "dat";
        switch (mimeType) {
            case "application/pdf": fileExtension = "pdf"; break;
            case "image/png": fileExtension = "png"; break;
            case "image/jpeg": fileExtension = "jpg"; break;
            case "image/bmp": fileExtension = "bmp"; break;
            default: console.warn("MIME Type không xác định, sử dụng đuôi .dat"); break;
        }

        if (url) {
            try {
                const link = document.createElement("a");
                const fileName = isVietnamese ? `Ho_so_benh_an.${fileExtension}` : `Medical_Record.${fileExtension}`;

                link.href = url;
                link.setAttribute("download", fileName);
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                message.error(isVietnamese ? "Lỗi khi tải file!" : "Error downloading file!");
            }
        } else {
            message.warning(isVietnamese ? "Không có tệp đính kèm!" : "No file attached!");
        }
    }, [url, mimeType, isVietnamese]);

    // Hàm xử lý TẢI VỀ TÓM TẮT BỆNH ÁN (Sử dụng lệnh in trình duyệt)
    const handlePrintSummary = useCallback(() => {
        message.info(isVietnamese ? "Hãy chọn 'Lưu dưới dạng PDF' trong hộp thoại In." : "Please select 'Save as PDF' in the print dialog.");
        window.print();
    }, [isVietnamese]);

    // Hàm xử lý hiển thị/ẩn trình xem file
    const handleTogglePreview = () => {
        setShowFilePreview(prev => !prev);
    };

    // Định nghĩa Footer cho Drawer
    const drawerFooter = (
        <div
            style={{ textAlign: 'right' }}
            className="d-flex justify-content-end align-items-center"
        >
            {/* NÚT TẢI VỀ TÓM TẮT/IN BÁO CÁO */}
            <Button
                key="print-summary"
                onClick={handlePrintSummary}
                style={{ marginRight: 8 }}
            >
                <FormattedMessage id="patient.appointment-patient.download-summary" />
            </Button>
            
            {/* NÚT ĐÓNG */}
            <Button key="close" onClick={onClose}>
                <FormattedMessage id="common.close" />
            </Button>
        </div>
    );

    return (
        <Drawer
            title={
                <FormattedMessage id="patient.appointment-patient.medical-record-detail" />
            }
            open={isOpen}
            onClose={onClose}
            placement="right"
            width={650}
            footer={drawerFooter}
            // KHẮC PHỤC LỖI DEPRECATED VÀ RESIZE OBSERVER
            destroyOnHidden={true} 
        >
            <h5 className="text-primary">
                <FormattedMessage id="patient.appointment-patient.medical-result" />
            </h5>
            <strong>{description || (isVietnamese ? "Không có" : "N/A")}</strong>

            <Divider><FormattedMessage id="patient.appointment-patient.patient-profile" /></Divider>

            <Descriptions bordered column={1} size="small" style={{ marginBottom: 20 }}>
                <Descriptions.Item label={<FormattedMessage id="patient.profile.height" />}>
                    {height ? `${height} cm` : (isVietnamese ? "Không có" : "N/A")} 
                </Descriptions.Item>
                <Descriptions.Item label={<FormattedMessage id="patient.profile.weight" />}>
                    {weight ? `${weight} kg` : (isVietnamese ? "Không có" : "N/A")}
                </Descriptions.Item>
                <Descriptions.Item label={<FormattedMessage id="patient.profile.underlying-diseases" />}>
                    {underlying_diseases || (isVietnamese ? "Không có" : "N/A")}
                </Descriptions.Item>
                <Descriptions.Item label={<FormattedMessage id="patient.profile.allergies" />}>
                    {allergies || (isVietnamese ? "Không có" : "N/A")}
                </Descriptions.Item>
                <Descriptions.Item label={<FormattedMessage id="patient.profile.medical-history" />}>
                    {medical_history || (isVietnamese ? "Không có" : "N/A")}
                </Descriptions.Item>
            </Descriptions>

            <Divider>
                <FormattedMessage id="patient.appointment-patient.attached-file" />
            </Divider>

            {hasFile ? (
                <div>
                    <div className="file-control-area mb-3">
                        {isDisplayable && (
                            <Button 
                                onClick={handleTogglePreview} 
                                type={showFilePreview ? "default" : "dashed"}
                                style={{ marginRight: 8 }}
                            >
                                {showFilePreview ? (
                                    <FormattedMessage id="patient.appointment-patient.hide-file" />
                                ) : (
                                    <FormattedMessage id="patient.appointment-patient.view-file" />
                                )}
                            </Button>
                        )}
                        {!isDisplayable && (
                            <p className="text-warning">
                                <FormattedMessage 
                                    id="patient.appointment-patient.cannot-display" 
                                    defaultMessage="Không thể hiển thị trực tiếp. Vui lòng tải về để xem." 
                                />
                            </p>
                        )}
                    </div>
                    <Button
                        key="download"
                        type="primary"
                        onClick={handleDownload}
                        style={{ marginRight: 8 }}
                    >
                        <FormattedMessage id="common.download" />
                    </Button>
                </div>
            ) : (
                <p>{isVietnamese ? "Không có tệp đính kèm" : "No attached file"}</p>
            )}

            {showFilePreview && isDisplayable && (
                <div className="file-preview-content mt-3">
                    {renderFileViewer(url, mimeType)}
                </div>
            )}
        </Drawer>
    );
};

export default ModalMedicalRecord;