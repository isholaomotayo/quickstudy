require("dotenv").config();

module.exports = {
  admit: (
    name,
    LoginCode = "",
    program = "Masters in Business Administration (MBA)"
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
                                                        <td align="left" style="padding: 0; font-size: 14px; font-family: Arial, sans-serif; color: #666666; text-decoration: none;"> <span style="color: #666666; text-decoration: none;"> <p align="center"><b>UNIVERSITY OF NIGERIA NSUKKA</b></p><p align="center"><b>CENTRE FOR DISTANCE AND e-LEARNING (CDeL)</b></p> </span></td>
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
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td bgcolor="#ffffff">
                    <div align="center" style="padding: 0px 15px 0px 15px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="500" class="wrapper">
                            <!-- LOGO/PREHEADER TEXT -->
                            <tr>
                                <td style="padding: 10px 0px 10px 0px;" class="logo">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td bgcolor="#ffffff" width="400" align="right" class="mobile-hide">
                                                <table border="0" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td align="left" style="padding: 0 50px 5px 0; font-size: 14px; font-family: Arial, sans-serif; color: #666666; text-decoration: none;"> <span style="color: #666666; text-decoration: none;"> <p><p><b>Vice-Chancellor</b>: Professor Charles Arizechukwu Igwe</p></p> </span></td>
                                                        <td align="right" style="padding: 0 0 5px 50px; font-size: 14px; font-family: Arial, sans-serif; color: #666666; text-decoration: none;"> <span style="color: #666666; text-decoration: none;"> <p><b>Director</b>: Professor Boniface Ginikanwa Nworgu</p> <p>MSTAN, NMAE, MAEAA, FIIAN, FAPQEN</p> </span></td>
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
                                            <!-- COPY -->
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                <tr>
</tr>
                                                <tr>
                                                    <td align="left" style="padding: 20px 0 0 0; font-size: 16px; line-height: 25px; font-family: Helvetica, Arial, sans-serif; color: #666666;" class="padding-copy"> <p><b><p>
                                                    Dear ${
                                                      name || "Applicant"
                                                    },</p></b><b>OFFER OF PROVISIONAL ADMISSION INTO THE DISTANCE LEARNING MBA
                                                            PROGRAMME</b></p> <p> <!--[if !supportLists]-->1. <!--[endif]-->With reference to your application for admission
                                                        to the Distance Learning postgraduate programme of the
                                                        university, I am pleased to inform you that you have been
                                                        offered <b>provisional admission</b> to pursue a Distance
                                                        Learning programme leading to the award of <b> ${program} </b> of the University of Nigeria with effect
                                                        from the 2019/2020 Academic Session.</p> <p> <!--[if !supportLists]-->2. <!--[endif]-->To indicate your acceptance of the offer, you
                                                        should pay a non-refundable acceptance fee of thirty-five thousand Naira
                                                        (N35,000.00) within two weeks of the receipt of this offer. To
                                                        pay your acceptance fee, click <i><a href=${
                                                          process.env
                                                            .FRONTEND_URL +
                                                          `/payments?code=` +
                                                          LoginCode
                                                        } target="_blank">here</a></i>.</p> <p>3. Please note that this offer of admission is strictly
                                                        provisional and may be withdrawn if:</p> <p>(a) you fail to formally accept this offer by paying the
                                                        application and acceptance fees of <a name="OLE_LINK2"></a><a name="OLE_LINK1">thirty-five thousand Naira (N35,000.00)
                                                            within two weeks of the receipt of this</a> offer,</p> <p>(b) you are unable to satisfy the necessary entry requirements
                                                        for admission and registration,</p> <p>(c) you cannot produce when required, the original copies of your
                                                        certificates, transcripts, NYSC discharge/exemption Certificate and other
                                                        academic credentials.</p> <p>(d) at any point in time it is discovered that you do not possess
                                                        the requisite entry qualification(s) as claimed in your
                                                        application.</p> <p> <!--[if !supportLists]-->3. <!--[endif]-->Congratulations on your admission and best wishes
                                                        for a successful programme.</p> <p>Yours sincerely,</p> <p><img width="120" src="https://res.cloudinary.com/emergingplatforms/image/upload/c_scale,w_262/v1579084404/logo/Signature_-_Anslem_Onah_jfhnao.png"/> </p> <p></p> <p></p> <p>&nbsp;<b>Mr. Anselem U. Onah</b> <p><i>Secretary to the Centre</i></p> </p> </td>
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
