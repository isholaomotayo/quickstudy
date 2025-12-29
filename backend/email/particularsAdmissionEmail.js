require("dotenv").config();

module.exports = {
  admit: (
    name,
    option = "",
    program = "Masters in Business Administration (MBA)",
    session
  ) => `<!DOCTYPE html>
<html lang="en">
    <head>
        <title>quickStudy | The Complete Learning Platform</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width">
        <style type="text/css">/* CLIENT-SPECIFIC STYLES */#outlook a { padding: 0; } /* Force Outlook to provide a "view in browser" message */.ReadMsgBody { width: 100%; } .ExternalClass { width: 100%; } /* Force Hotmail to display emails at full width */.ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; } /* Force Hotmail to display normal line spacing */body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; } /* Prevent WebKit and Windows mobile changing default text sizes */table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; } /* Remove spacing between tables in Outlook 2007 and up */img { -ms-interpolation-mode: bicubic; } /* Allow smoother rendering of resized image in Internet Explorer *//* RESET STYLES */body { margin: 0; padding: 0; } img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; } table { border-collapse: collapse !important; } body { height: 100% !important; margin: 0; padding: 0; width: 100% !important; } /* iOS BLUE LINKS */.appleBody a { color: #68440a; text-decoration: none; } .appleFooter a { color: #999999; text-decoration: none; } /* MOBILE STYLES */@media screen and (max-width: 525px) { /* ALLOWS FOR FLUID TABLES */ table[class="wrapper"] {  width: 100% !important; }  /* ADJUSTS LAYOUT OF LOGO IMAGE */ td[class="logo"] {  text-align: left;  padding: 20px 0 20px 0 !important; }  td[class="logo"] img {  margin: 0 auto !important; }  /* USE THESE CLASSES TO HIDE CONTENT ON MOBILE */ td[class="mobile-hide"] {  display: none; }  img[class="mobile-hide"] {  display: none !important; }  img[class="img-max"] {  max-width: 100% !important;  height: auto !important; }  /* FULL-WIDTH TABLES */ table[class="responsive-table"] {  width: 100% !important; }  /* UTILITY CLASSES FOR ADJUSTING PADDING ON MOBILE */ td[class="padding"] {  padding: 10px 5% 15px 5% !important; }  td[class="padding-copy"] {  padding: 10px 5% 10px 5% !important;  text-align: center; }  td[class="padding-meta"] {  padding: 30px 5% 0px 5% !important;  text-align: center; }  td[class="no-pad"] {  padding: 0 0 20px 0 !important; }  td[class="no-padding"] {  padding: 0 !important; }  td[class="section-padding"] {  padding: 50px 15px 50px 15px !important; }  td[class="section-padding-bottom-image"] {  padding: 50px 15px 0 15px !important; }  /* ADJUST BUTTONS ON MOBILE */ td[class="mobile-wrapper"] {  padding: 10px 5% 15px 5% !important; }  table[class="mobile-button-container"] {  margin: 0 auto;  width: 100% !important; }  a[class="mobile-button"] {  width: 80% !important;  padding: 15px !important;  border: 0 !important;  font-size: 16px !important; } }</style>
    </head>
    <body style="margin: 0; padding: 0;">
        <!-- HEADER -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td bgcolor="#ffffff">
                    <div align="center" style="padding: 0px 15px 0px 15px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="500" class="wrapper">
                            <!-- LOGO/PREHEADER TEXT -->
                            <tr>
                                <td style="padding: 20px 0px 0px 0px;" class="logo">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td bgcolor="#ffffff" width="400" align="right" class="mobile-hide">
                                                <table border="0" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td align="left" style="padding: 0 10px 5px 0; font-size: 14px; font-family: Arial, sans-serif; color: #666666; text-decoration: none;"> <span style="color: #666666; text-decoration: none;"> <p><p><img width="80" src="https://res.cloudinary.com/emergingplatforms/image/upload/v1579082933/logo/unnLogo_phrryv.png"/></p></p> </span></td>
                                                        <td align="left" style="padding: 0; font-size: 14px; font-family: Arial, sans-serif; color: #666666; text-decoration: none;"> <span style="color: #666666; text-decoration: none;"> <p align="center"><b>UNIVERSITY OF NIGERIA NSUKKA</b></p><p align="center"><b>CENTRE FOR DISTANCE AND e-LEARNING (CDeL)</b></p> <p align="center" font-size: 10px;>CDeL complex, University of Nigeria Nsukka. P.O. Box 3236, Nsukka 410001, Enugu State, Nigeria. Email: info.cdel@unn.edu.ng</p> </span></td>
                                                        <td align="right" style="padding: 0 0 5px 10px; font-size: 14px; font-family: Arial, sans-serif; color: #666666; text-decoration: none;"> <span style="color: #666666; text-decoration: none;"> <p><img width="80" src="https://res.cloudinary.com/emergingplatforms/image/upload/v1579082933/logo/cdelLogo_mtmm1j.png"/></p> </span></td>
                                                        
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </div>
                </td>
            </tr>
        </table>
        
        <hr>
        <!-- ONE COLUMN SECTION -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td bgcolor="#ffffff" align="center" style="padding: 10px 15px 70px 15px;" class="section-padding">
                    <table border="0" cellpadding="0" cellspacing="0" width="500" class="responsive-table">
                        <tr>
                            <td>
                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td>
                                        <b>PARTICULARS OF ADMISSION </b>
                                            <!-- COPY -->
                                            <table width="100%" border="2" cellspacing="2" cellpadding="2">
                                                <tr>
                                                </tr>

                                                <tr>
                                                </tr>

                                                <tr>
                                                <td width="30%"><b>NAME OF STUDENT</b></td>
                                                <td width="70%">${
                                                  name || "Applicant"
                                                }</td>
                                                </tr>

                                                <tr>
                                                <td width="30%"><b>FACULTY</b></td>
                                                <td width="70%">Business Administration</td>
                                                </tr>

                                                <tr>
                                                <td width="30%"><b>PROGRAMME</b></td>
                                                <td width="70%">${program}</td>
                                                </tr>

                                                <tr>
                                                <td width="30%"><b>ACADEMIC SESSION</b></td>
                                                <td width="70%">${session}</td>
                                                </tr>
                                                    
                                                <tr>
                                                <td width="30%"><b>FIELD OF STUDY</b></td>
                                                <td width="70%">${option}</td>
                                                </tr>

                                                <tr>
                                                <td width="30%"><b>DEGREE IN VIEW</b></td>
                                                <td width="70%">Masters in Business Administration</td>
                                                </tr>

                                                <tr>
                                                <td width="30%"><b>MODE OF STUDY</b></td>
                                                <td width="70%"><p>By coursework, industrial/on-the-job experience ad research work
                                                    to be embodied in project report, where coursework
                                                    predominates.
                                                    The mode of delivery shall be the Distance Learning (DL) mode,
                                                    employing the <b>ICT-Enabled Supported Blended Learning
                                                    (IESSBL)</b> model.
                                                </p></td>
                                                </tr>

                                                <tr>
                                                <td width="30%"><b>PERIOD OF STUDY</b></td>
                                                <td width="70%"><p>Minimum of 18 calendar months (4 semesters).</p></td>
                                                </tr>


                                                <tr>
                                                <td width="30%"><b>SUPERVISORS</b></td>
                                                <td width="70%"><p>Kalu, Ebere Ume <i> PhD, ACIB, ACIA, MNIA.</i></p></td>
                                                </tr>


                                                <tr>
                                                <td width="30%"><b>OTHER CONDITIONS</b></td>
                                                <td width="70%">
                                                <p>
                                                <!--[if !supportLists]-->1. <!--[endif]-->Every student must pay all fees (tuition and other applicable
                                                    fees), before the date communicated for each semester in
                                                    accordance with University’s procedures and deadlines.
                                                </p>
                                                <p>
                                                <!--[if !supportLists]-->2. <!--[endif]-->Students can choose to pay their tuition fees monthly, per
                                                semester, per session or all at once.
                                                </p>

                                                <p>
                                                <!--[if !supportLists]-->3. <!--[endif]-->For those with HND, third class, or non-business related
                                                courses, you are to complete a PGD-equivalent bridge/remedial programme offered by the Centre specially designed
                                                as a pre-requisite for the full MBA programme.
                                                </p>
                                                </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <!-- BULLETPROOF BUTTON -->
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0" class="mobile-button-container">
                                                <tr>
</tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <!-- FOOTER -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td bgcolor="#ffffff" align="center">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center">
                        <tr>
                            <td style="padding: 20px 0px 20px 0px;">
                                <!-- UNSUBSCRIBE COPY -->
                                <table width="500" border="0" cellspacing="0" cellpadding="0" align="center" class="responsive-table">
                                    <tr>
                                        <td align="center" valign="middle" style=" font-size: 12px; line-height: 18px; font-family: Helvetica, Arial, sans-serif; color:#666666;"> <span class="appleFooter" style="color:#666666;">University of Nigeria Nsukka</span><br><a class="original-only" style="color: #666666; text-decoration: none;">Unsubscribe</br><span class="original-only" style="font-family: Arial, sans-serif; font-size: 12px; color: #444444;">&nbsp;&nbsp;&nbsp; </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>`,
};
