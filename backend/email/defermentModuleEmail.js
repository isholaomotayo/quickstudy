module.exports = {
  defermentModuleEmail: (name, matricNo = "", duration = "", reason = "") => {
    let defermentSubject,
      resumptionSubject,
      defermentMessage,
      resumptionMessage,
      defermentSuccess,
      resumptionSuccess,
      mail;

    defermentSubject = `Deferral Request for ${name}/${matricNo}`;

    resumptionSubject = `Notice of Request for Resumption for ${name}/${matricNo}`;

    defermentMessage = `Dear Sirs,
        I am writing to formally request to defer my current level in the UNN MBA distance learning program for
        this ${duration} for the following reason of ${reason}.
        Thank you in advance your consideration.
                                                                      
        Best Regards, ${name}.`;

    resumptionMessage = `Dear Sirs,
        I am writing to formally request to continue learning in the UNN MBA Distance Learning program. I had initially requested to defer my program and this was granted and I am now ready to resume.
        Thank you in advance your consideration.
        
        Best Regards, ${name}.`;

    defermentSuccess = `Dear ${name}
        Your request for deferment has been approved by the university management.
        Regards,
        UNN CDeL.
    `;

    resumptionSuccess = `Dear ${name}
        Your request for resumption has been approved by the university management.
        Regards,
        UNN CDeL.
    `;

    mail = {
      defermentSubject,
      resumptionSubject,
      defermentMessage,
      resumptionMessage,
      defermentSuccess,
      resumptionSuccess
    };

    return mail;
  },
  deferStart: (
    name,
    matricNo = "",
    duration = "",
    reason = ""
  ) => `<!DOCTYPE html>
  <html lang="en">
      <head>
          <title>Deferral Request for ${name}/${matricNo}</title>
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
                                                      Dear Sirs,</p></b><b>Deferral Request for ${name}/${matricNo}
                                                              </b></p> <p> <!--[if !supportLists]--> <!--[endif]--> I am writing to formally request to defer my current level in the UNN MBA distance learning program for
                                                              this ${duration} for the following reason of ${reason}.
                                                              Thank you in advance your consideration.                                                         
                                                               <p>Best Regards,</p>
                                                               <p>${name}</p></td>
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
  resumptionStart: (name, matricNo = "") => `<!DOCTYPE html>
  <html lang="en">
    <head>
        <title>Notice of Request for Resumption for ${name}/${matricNo}</title>
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
                                                    Dear Sirs,</p></b><b>I am writing to formally request to continue learning in the UNN MBA Distance Learning program. I had initially requested to defer my program and this was granted and I am now ready to resume.
                                                    Thank you in advance your consideration.                                                       
                                                             <p>Best Regards,</p>
                                                             <p>${name}.</p></td>
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
  deferResponse: (name, matricNo = "") => `<!DOCTYPE html>
  <html lang="en">
    <head>
        <title>Deferment Request Response</title>
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
                                                    Dear ${name},</p></b><b>
                                                    Your request for deferment has been approved by the university management.
                                                    Regards,                                                     
                                                             <p>Best Regards, UNN CDeL.</p>
                                                             <p>UNN CDeL.</p></td>
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
  resumptionResponse: (name, matricNo = "") => `<!DOCTYPE html>
  <html lang="en">
    <head>
        <title>Resumption Request Response</title>
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
                                                    Dear ${name},</p></b><b>
                                                    Your request for resumption has been approved by the university management.
                                                    Regards,                                                     
                                                             <p>Best Regards,</p>
                                                             <p>UNN CDeL.</p></td>
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
  </html>`
};
