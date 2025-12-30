export interface AdmissionLetterData {
  student: {
    name: string;
    regNo: string;
    email: string;
    programme: string;
    session: string;
    fieldOfStudy?: string;
    entryLevelId: number;
    loginCode?: string;
  };
  institution: {
    logo?: string | null;
    secondary_logo?: string | null;
    name: string;
    address: string;
    email: string;
    admission_mail?: string | null;
    vice_chancellor_name?: string | null;
    director_name?: string | null;
    director_credentials?: string | null;
    secretary_name?: string | null;
    secretary_signature?: string | null;
    director_signature?: string | null;
  };
  programme: {
    name: string;
    department?: string | null;
    faculty?: string | null;
  };
  frontendUrl?: string;
}

export function generateAdmissionLetterHTML(data: AdmissionLetterData): string {
  const {
    student,
    institution,
    programme,
    frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || "",
  } = data;

  const isPreMBA = student.entryLevelId === 1;
  const showOfficials = !!(institution.vice_chancellor_name || institution.director_name);
  const showSecondaryLogo = !!institution.secondary_logo;
  const signatureUrl = institution.secretary_signature || institution.director_signature;
  const fromEmail = institution.admission_mail || institution.email;

  // Payment link
  const paymentLink = student.loginCode
    ? `${frontendUrl}/payments?code=${student.loginCode}`
    : `${frontendUrl}/payments`;

  return `<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Admission Letter | ${institution.name}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width">
        <style type="text/css">
            /* CLIENT-SPECIFIC STYLES */
            #outlook a { padding: 0; }
            .ReadMsgBody { width: 100%; }
            .ExternalClass { width: 100%; }
            .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
            body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            img { -ms-interpolation-mode: bicubic; }
            
            /* RESET STYLES */
            body { margin: 0; padding: 0; }
            img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
            table { border-collapse: collapse !important; }
            body { height: 100% !important; margin: 0; padding: 0; width: 100% !important; }
            
            /* iOS BLUE LINKS */
            .appleBody a { color: #68440a; text-decoration: none; }
            .appleFooter a { color: #999999; text-decoration: none; }
            
            /* MOBILE STYLES */
            @media screen and (max-width: 525px) {
                table[class="wrapper"] { width: 100% !important; }
                td[class="logo"] { text-align: left; padding: 20px 0 20px 0 !important; }
                td[class="logo"] img { margin: 0 auto !important; }
                td[class="mobile-hide"] { display: none; }
                img[class="mobile-hide"] { display: none !important; }
                img[class="img-max"] { max-width: 100% !important; height: auto !important; }
                table[class="responsive-table"] { width: 100% !important; }
                td[class="padding"] { padding: 10px 5% 15px 5% !important; }
                td[class="padding-copy"] { padding: 10px 5% 10px 5% !important; text-align: center; }
                td[class="padding-meta"] { padding: 30px 5% 0px 5% !important; text-align: center; }
                td[class="no-pad"] { padding: 0 0 20px 0 !important; }
                td[class="no-padding"] { padding: 0 !important; }
                td[class="section-padding"] { padding: 50px 15px 50px 15px !important; }
                td[class="section-padding-bottom-image"] { padding: 50px 15px 0 15px !important; }
                td[class="mobile-wrapper"] { padding: 10px 5% 15px 5% !important; }
                table[class="mobile-button-container"] { margin: 0 auto; width: 100% !important; }
                a[class="mobile-button"] { width: 80% !important; padding: 15px !important; border: 0 !important; font-size: 16px !important; }
            }
        </style>
    </head>
    <body style="margin: 0; padding: 0;">
        <!-- HEADER -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td bgcolor="#ffffff">
                    <div align="center" style="padding: 0px 15px 0px 15px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="500" class="wrapper">
                            <tr>
                                <td style="padding: 20px 0px 0px 0px;" class="logo">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td bgcolor="#ffffff" width="400" align="right" class="mobile-hide">
                                                <table border="0" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        ${institution.logo ? `<td align="left" style="padding: 0 10px 5px 0; font-size: 14px; font-family: Arial, sans-serif; color: #666666; text-decoration: none;">
                                                            <span style="color: #666666; text-decoration: none;">
                                                                <p><p><img width="80" src="${institution.logo}" alt="Institution Logo"/></p></p>
                                                            </span>
                                                        </td>` : ''}
                                                        <td align="left" style="padding: 0; font-size: 14px; font-family: Arial, sans-serif; color: #666666; text-decoration: none;">
                                                            <span style="color: #666666; text-decoration: none;">
                                                                <p align="center"><b>${institution.name}</b></p>
                                                                ${programme.department ? `<p align="center"><b>${programme.department}</b></p>` : ''}
                                                                ${institution.address ? `<p align="center" style="font-size: 10px;">${institution.address}</p>` : ''}
                                                                ${fromEmail ? `<p align="center" style="font-size: 10px;">Email: ${fromEmail}</p>` : ''}
                                                            </span>
                                                        </td>
                                                        ${showSecondaryLogo && institution.secondary_logo ? `<td align="right" style="padding: 0 0 5px 10px; font-size: 14px; font-family: Arial, sans-serif; color: #666666; text-decoration: none;">
                                                            <span style="color: #666666; text-decoration: none;">
                                                                <p><img width="80" src="${institution.secondary_logo}" alt="Secondary Logo"/></p>
                                                            </span>
                                                        </td>` : ''}
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
        ${showOfficials ? `<table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td bgcolor="#ffffff">
                    <div align="center" style="padding: 0px 15px 0px 15px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="500" class="wrapper">
                            <tr>
                                <td style="padding: 10px 0px 10px 0px;" class="logo">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td bgcolor="#ffffff" width="400" align="right" class="mobile-hide">
                                                <table border="0" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        ${institution.vice_chancellor_name ? `<td align="left" style="padding: 0 50px 5px 0; font-size: 14px; font-family: Arial, sans-serif; color: #666666; text-decoration: none;">
                                                            <span style="color: #666666; text-decoration: none;">
                                                                <p><p><b>Vice-Chancellor</b>: ${institution.vice_chancellor_name}</p></p>
                                                            </span>
                                                        </td>` : ''}
                                                        ${institution.director_name ? `<td align="right" style="padding: 0 0 5px 50px; font-size: 14px; font-family: Arial, sans-serif; color: #666666; text-decoration: none;">
                                                            <span style="color: #666666; text-decoration: none;">
                                                                <p><b>Director</b>: ${institution.director_name}</p>
                                                                ${institution.director_credentials ? `<p>${institution.director_credentials}</p>` : ''}
                                                            </span>
                                                        </td>` : ''}
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
        </table>` : ''}
        <hr>
        <!-- ADMISSION LETTER CONTENT -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td bgcolor="#ffffff" align="center" style="padding: 10px 15px 70px 15px;" class="section-padding">
                    <table border="0" cellpadding="0" cellspacing="0" width="500" class="responsive-table">
                        <tr>
                            <td>
                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td>
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                <tr>
                                                    <td align="left" style="padding: 20px 0 0 0; font-size: 16px; line-height: 25px; font-family: Helvetica, Arial, sans-serif; color: #666666;" class="padding-copy">
                                                        <p><b>
                                                            <p>Dear ${student.name || "Applicant"},</p>
                                                        </b></p>
                                                        <p><b>OFFER OF PROVISIONAL ADMISSION${isPreMBA ? ' (Pre-MBA)' : ''}</b></p>
                                                        <p>1. With reference to your application for admission${programme.department ? ` to the ${programme.department}` : ''}${programme.faculty ? ` of the ${programme.faculty}` : ''} of ${institution.name}, I am pleased to inform you that you have been offered <b>provisional admission</b> to pursue ${isPreMBA ? 'a Pre-MBA programme' : `a programme leading to the award of ${student.programme}`} with effect from the ${student.session} Academic Session.</p>
                                                        ${isPreMBA ? `<p>You have been awarded admission into the <b>Pre-MBA Program</b>. This is to plug the envisaged knowledge gap as MBA students are required to have a background knowledge in the Business discipline.</p>
                                                        <p>The Pre-MBA is an additional semester that introduces students to the basic principles of business concepts.</p>` : ''}
                                                        <p>2. To indicate your acceptance of the offer, you should pay a non-refundable acceptance fee within two weeks of the receipt of this offer. To pay your acceptance fee, click <i><a href="${paymentLink}" target="_blank">here</a></i>.</p>
                                                        <p>3. Please note that this offer of admission is strictly provisional and may be withdrawn if:</p>
                                                        <p>(a) you fail to formally accept this offer by paying the application and acceptance fees within two weeks of the receipt of this offer,</p>
                                                        <p>(b) you are unable to satisfy the necessary entry requirements for admission and registration,</p>
                                                        <p>(c) you cannot produce when required, the original copies of your certificates, transcripts, NYSC discharge/exemption Certificate and other academic credentials.</p>
                                                        <p>(d) at any point in time it is discovered that you do not possess the requisite entry qualification(s) as claimed in your application.</p>
                                                        <p>4. Congratulations on your admission and best wishes for a successful programme.</p>
                                                        <p>Yours sincerely,</p>
                                                        ${signatureUrl ? `<p><img width="120" src="${signatureUrl}" alt="Signature"/></p>` : ''}
                                                        ${institution.secretary_name ? `<p><b>${institution.secretary_name}</b></p>` : institution.director_name ? `<p><b>${institution.director_name}</b></p>` : ''}
                                                        ${institution.secretary_name ? `<p><i>Secretary</i></p>` : institution.director_name ? `<p><i>Director</i></p>` : ''}
                                                    </td>
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
        <!-- PARTICULARS OF ADMISSION -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td bgcolor="#ffffff" align="center" style="padding: 10px 15px 70px 15px;" class="section-padding">
                    <table border="0" cellpadding="0" cellspacing="0" width="500" class="responsive-table">
                        <tr>
                            <td>
                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td>
                                            <b>PARTICULARS OF ADMISSION</b>
                                            <table width="100%" border="2" cellspacing="2" cellpadding="2" style="margin-top: 10px;">
                                                <tr>
                                                    <td width="30%"><b>NAME OF STUDENT</b></td>
                                                    <td width="70%">${student.name || "Applicant"}</td>
                                                </tr>
                                                <tr>
                                                    <td width="30%"><b>REGISTRATION NUMBER</b></td>
                                                    <td width="70%">${student.regNo || "Pending"}</td>
                                                </tr>
                                                ${programme.faculty ? `<tr>
                                                    <td width="30%"><b>FACULTY</b></td>
                                                    <td width="70%">${programme.faculty}</td>
                                                </tr>` : ''}
                                                <tr>
                                                    <td width="30%"><b>PROGRAMME</b></td>
                                                    <td width="70%">${student.programme}</td>
                                                </tr>
                                                <tr>
                                                    <td width="30%"><b>ACADEMIC SESSION</b></td>
                                                    <td width="70%">${student.session}</td>
                                                </tr>
                                                ${student.fieldOfStudy ? `<tr>
                                                    <td width="30%"><b>FIELD OF STUDY</b></td>
                                                    <td width="70%">${student.fieldOfStudy}</td>
                                                </tr>` : ''}
                                                <tr>
                                                    <td width="30%"><b>DEGREE IN VIEW</b></td>
                                                    <td width="70%">${student.programme}</td>
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
                                <table width="500" border="0" cellspacing="0" cellpadding="0" align="center" class="responsive-table">
                                    <tr>
                                        <td align="center" valign="middle" style="font-size: 12px; line-height: 18px; font-family: Helvetica, Arial, sans-serif; color:#666666;">
                                            <span class="appleFooter" style="color:#666666;">${institution.name}</span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>`;
}

