import {Card, Row, Col, FormControl} from 'react-bootstrap'
import { Editor } from "@tinymce/tinymce-react";
import Modal from './Modal'
import DBForm from '../helpers/DBForm'
import { quizOptionsFormat } from '../helpers/utils'
import { editorInit } from '../helpers/tinyMCE'
import { TINYMCE_KEY, FILE_CLOUD_NAME } from "../constants"
import createCloudinary from "../helpers/createCloudinary"
import { FilePond, registerPlugin } from "react-filepond"
import FilePondPluginFilePoster from "filepond-plugin-file-poster"

import "filepond/dist/filepond.min.css"

const CourseQuestion = ({question, ...props}) => {
    const myData = props.userData,
        writeAccess = props.writeAccess,
        iCanWrite = props.writeAccess && writeAccess.indexOf(myData.role) > -1,
        iCanDelete = props.deleteAccess && props.deleteAccess.indexOf(myData.role) > -1,
        iCanTakeTest = myData.role == 'STUDENT',
        [answersByFieldState, handleAnswerChange] = props.changeManagers || [null, null],
        [testPropertyName, setTest] = props.setParentManagers || [null, null],
        parentTest = props.parentTest || null
        //console.log(answersByFieldState)

    let answerFieldID = `question_answer__${question.id}`,
        uploadedFileName = "",
        friendlyFileName = "",
        fileExt = ""
    
    if (question.textsubmits && question.textsubmits.file_answer) {
        uploadedFileName = question.textsubmits.file_answer.split(FILE_CLOUD_NAME)[1],
        friendlyFileName = `test-${parentTest.course_test_id}__q-${question.order}__${parentTest.user.username}`

        let fileameParts = uploadedFileName.split(".")
        fileExt = fileameParts.pop()
        uploadedFileName = fileameParts.join(".")
    }
    
    return (
    <Card>
        <Card.Body>
        <Row>
            <Col xs={11}>
                <div className="font-weight-bold">
                {question.order ? question.order+'. ' : ''} 
                {question.question}
                </div>
                {
                    question.details
                    ?
                        <div 
                            className="p-2"
                            dangerouslySetInnerHTML={ {__html: question.details} }
                        >
                        </div>

                    :
                        ''
                }
                {
                    question.marks
                    ? <div className="small-text">{`(${question.marks} mark${question.marks > 1 ? 's' : ''})`}</div>
                    : ""
                }
            </Col>
            <Col xs={1}>
                {
                    iCanWrite
                    ?
                    <div className="text-right">
                        <Modal
                            openBtnIconClass="fa fa-pencil"
                            openBtnSize='xs'
                            preModalTitle={`Edit:`}
                            modalTitle={question.question}
                            modalSize="lg"
                            enforceFocus={false}
                            >
                            {
                                closeModal => (
                                    <DBForm 
                                        tableName="course_question"
                                        formSchema={props.formSchema}
                                        rowData={question} 
                                        //setTableRow={setTableRow(...props.tableManagers)}
                                        setTableRow={props.setTableRow}
                                        afterSuccess={closeModal}
                                        formFields={props.formFields || []}
                                        editorField="details"
                                        editorHeight={240}
                                        jsonFields={{options: quizOptionsFormat}}
                                        setRelatedManagers={[testPropertyName, setTest]}
                                        />
                                )
                            }
                        </Modal>
                    </div>
                    :
                    ''
                }
            </Col>
        </Row>
        {
        parentTest.format == "quiz"
        ?
            <Row className="answers">
                <Col xs={11} className="checkbox check-success">
                {Object.entries(quizOptionsFormat).map(([key, optionFormat]) => {
                    if (key in question.options && question.options[key].text) {
                        answerFieldID = `question_answer__${question.id}__${key}`
                        let option = (question.options && question.options[key]) || optionFormat
                        //console.log(option)
                        return (
                        <div 
                            key={answerFieldID} 
                            className="d-inline-block m-2"
                        >
                            <input 
                                type="checkbox" 
                                value={key}
                                name={answerFieldID} 
                                id={answerFieldID} 
                                checked={
                                    parentTest.submitted_at
                                    ?
                                        option.is_answer
                                    :
                                        iCanTakeTest 
                                        ? (answersByFieldState[answerFieldID] || false) 
                                        : null
                                }
                                onChange={iCanTakeTest ? handleAnswerChange: null}
                                disabled={props.disabled ? "disabled" : false}
                            />
                            <label htmlFor={answerFieldID}>
                                {`${key.toUpperCase()}: ${option.text}`}
                            </label>
                        </div>
                        )
                    }
                })
                }
                </Col>
                <Col xs={1}>
                {
                    iCanDelete
                    ?
                    <div className="del-btn-wrapper">
                        <a 
                            id={`del0__course_question__{question.id}`}
                            className="del-button text-danger d-block w-100 text-right" 
                            title="Delete" 
                            onClick={props.handleDelete}
                        >
                            <i id={`del__course_question__${question.id}`} className="fa fa-times-circle-o fa-lg mr-1" />
                        </a>
                    </div>
                    :
                    ''
                }
                </Col>
            </Row>
        :
            <div className={`text-answer ${iCanTakeTest  ? "" : "nowrite"}`}>
            {
                parentTest.submitted_at 
                ?
                <Card>
                    <Card.Body>
                        {
                            question.textsubmits && question.textsubmits.text_answer
                            ?
                            <div
                                className="answer-content"
                                dangerouslySetInnerHTML={{
                                __html: (question.textsubmits && question.textsubmits.text_answer) || ""
                                }}
                            ></div>
                            : ""
                        }
                        {
                            uploadedFileName
                            ?
                            <div className="answer-file">
                                <a 
                                    href={`/api/download?f=${uploadedFileName}&n=${friendlyFileName}&e=${fileExt}`}
                                >
                                    Download Submitted File
                                </a>
                            </div>
                            : ""
                        }
                    </Card.Body>
                </Card>
                :
                <>
                <Editor
                    apiKey={TINYMCE_KEY}
                    disabled={!iCanTakeTest}
                    init={editorInit(400, iCanTakeTest ? 0 : 1)}
                    textareaName={answerFieldID}
                    initialValue={
                        iCanTakeTest 
                        ? ((answersByFieldState[answerFieldID] 
                            && answersByFieldState[answerFieldID].text) || "") 
                        : "(Only students can write here)"
                    }
                    onChange={iCanTakeTest ? handleAnswerChange: null}
                />
                <br />
                <FilePond
                    files={
                        answersByFieldState 
                            && answersByFieldState[answerFieldID] 
                            && answersByFieldState[answerFieldID].file
                        ?   [
                                {
                                    // the server file reference
                                    source: answersByFieldState[answerFieldID].file,

                                    // set type to local to indicate an already uploaded file
                                    options: {
                                        type: "local",
                                        // file: {
                                        //     name: uploadedFileName
                                        // }
                                    }
                                }
                            ]
                        : null
                    }
                    name={`${answerFieldID}-file`}
                    disabled={!iCanTakeTest}
                    allowMultiple={false}
                    maxFiles={1}
                    server={createCloudinary(
                        "emergingplatforms",
                        "ilearn",
                        "assignment", // tag for upload
                        async secure_url => {
                            handleAnswerChange({
                                target: {
                                    name: `${answerFieldID}`,
                                    value: {
                                        text: (answersByFieldState[answerFieldID]
                                            && answersByFieldState[answerFieldID].text) || "",
                                        file: secure_url
                                    }
                                }
                            })
                        }
                    )}
                    // oninit={() => this.handleInit()}
                />
                </>
            }
            </div>
        }
        </Card.Body>
        <style jsx>{`
            .card .card-header { background: none; }
            
            a.del-button:hover  {
                cursor: pointer !important;
            }

            .text-danger    {
                color: pink !important;
            }

            .mce-content-readonly p {
                font-size: 0.6em !important;
                color: #ccc !important;
            }
    `}</style>
    </Card>
    )
};

export default CourseQuestion
