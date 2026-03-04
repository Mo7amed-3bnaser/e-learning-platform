import nodemailer from 'nodemailer';

// ── Singleton transporter with connection pooling ──────────────────
let _transporter = null;

const getTransporter = () => {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      pool: true,          // reuse connections
      maxConnections: 5,   // limit concurrent SMTP connections
      maxMessages: 100,    // messages per connection before reconnect
      connectionTimeout: 10000,  // 10 seconds to establish connection
      greetingTimeout: 10000,    // 10 seconds for SMTP greeting
      socketTimeout: 15000,      // 15 seconds for socket inactivity
    });
  }
  return _transporter;
};

/**
 * Send email using Nodemailer + Gmail
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 */
const sendEmail = async (options) => {
  const transporter = getTransporter();

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_FROM || `Masar | مسار <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);

  return info;
};

/**
 * Generate password reset email HTML template
 * Uses Masar brand colors and identity with hosted logo images
 * @param {string} userName - User's name
 * @param {string} resetUrl - Password reset URL
 * @returns {string} HTML email template
 */
export const getResetPasswordTemplate = (userName, resetUrl) => {
  const logoDark = process.env.EMAIL_LOGO_DARK || '';
  const logoLight = process.env.EMAIL_LOGO_LIGHT || '';

  return `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إعادة تعيين كلمة المرور - مسار</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; direction: rtl;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f1f5f9;">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table role="presentation" style="width: 580px; max-width: 100%; border-collapse: collapse;">
            
            <!-- Top Logo Area -->
            <tr>
              <td align="center" style="padding: 0 0 24px 0;">
                <table role="presentation" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding-left: 14px; vertical-align: middle;">
                      <span style="font-size: 24px; font-weight: 700; color: #1e3a5f; letter-spacing: 0.5px;">Masar</span>
                      <span style="color: #cbd5e1; font-weight: 300; margin: 0 6px;">|</span>
                      <span style="font-size: 24px; font-weight: 700; color: #1e3a5f;">مسار</span>
                    </td>
                    <td style="vertical-align: middle;">
                      ${logoDark ? `<img src="${logoDark}" alt="Masar Logo" width="48" height="37" style="display: block;" />` : ''}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Main Card -->
            <tr>
              <td>
                <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(30, 58, 95, 0.08);">
                  
                  <!-- Header Banner -->
                  <tr>
                    <td style="background-color: #1e3a5f; background-image: linear-gradient(135deg, #1e3a5f 0%, #0d2137 100%); padding: 36px 32px 32px; text-align: center;">
                      <!-- Orange accent line -->
                      <div style="width: 50px; height: 4px; background-color: #f97316; border-radius: 2px; margin: 0 auto 20px;"></div>
                      
                      <!-- Light Logo in header -->
                      ${logoLight ? `
                      <div style="margin-bottom: 20px;">
                        <img src="${logoLight}" alt="Masar" width="72" height="55" style="display: inline-block;" />
                      </div>
                      ` : ''}
                      
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.3px;">
                        إعادة تعيين كلمة المرور
                      </h1>
                      <div style="width: 40px; height: 3px; background-color: #f97316; border-radius: 2px; margin: 16px auto 0;"></div>
                    </td>
                  </tr>
                  
                  <!-- Body Content -->
                  <tr>
                    <td style="padding: 36px 32px 20px;">
                      <!-- Greeting -->
                      <p style="color: #1e3a5f; font-size: 18px; margin: 0 0 6px 0; font-weight: 600;">
                        مرحباً ${userName} 👋
                      </p>
                      <p style="color: #64748b; font-size: 15px; line-height: 1.8; margin: 0 0 28px 0;">
                        تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بحسابك على منصة <strong style="color: #1e3a5f;">مسار</strong>. اضغط على الزر أدناه لإنشاء كلمة مرور جديدة.
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td align="center" style="padding: 8px 0 28px;">
                            <a href="${resetUrl}" 
                               style="display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 15px 44px; border-radius: 12px; font-size: 16px; font-weight: 700; letter-spacing: 0.3px; mso-padding-alt: 0; text-align: center;">
                              <!--[if mso]><i style="letter-spacing: 44px; mso-font-width: -100%; mso-text-raise: 30pt;">&nbsp;</i><![endif]-->
                              <span style="mso-text-raise: 15pt;">🔑 إعادة تعيين كلمة المرور</span>
                              <!--[if mso]><i style="letter-spacing: 44px; mso-font-width: -100%;">&nbsp;</i><![endif]-->
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Divider -->
                      <div style="border-top: 1px solid #e2e8f0; margin: 4px 0 24px;"></div>
                      
                      <!-- Warning Box -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="background-color: #fef9f1; border-radius: 12px; padding: 16px 18px; border-right: 4px solid #f97316;">
                            <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.7;">
                              <strong>⏱️ ملاحظة:</strong> هذا الرابط صالح لمدة <strong>15 دقيقة فقط</strong>. إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذا البريد وكلمة مرورك الحالية ستظل كما هي.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Alternative Link Section -->
                  <tr>
                    <td style="padding: 0 32px 32px;">
                      <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 16px 0 6px 0;">
                        إذا لم يعمل الزر، انسخ الرابط التالي والصقه في المتصفح:
                      </p>
                      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; word-break: break-all; direction: ltr; text-align: left;">
                        <a href="${resetUrl}" style="font-size: 11px; color: #2d5a8a; text-decoration: none; word-break: break-all;">${resetUrl}</a>
                      </div>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 28px 20px 12px; text-align: center;">
                <!-- Footer Logo -->
                ${logoDark ? `
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td align="center" style="padding-bottom: 12px;">
                      <img src="${logoDark}" alt="Masar" width="36" height="28" style="display: inline-block; opacity: 0.6;" />
                    </td>
                  </tr>
                </table>
                ` : ''}
                <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px 0;">
                  © ${new Date().getFullYear()} <span style="color: #1e3a5f; font-weight: 600;">Masar | مسار</span> — جميع الحقوق محفوظة
                </p>
                <p style="color: #cbd5e1; font-size: 11px; margin: 6px 0 0 0;">
                  هذا البريد الإلكتروني تم إرساله تلقائيًا، لا ترد عليه.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

/**
 * Generate email verification HTML template
 * Uses Masar brand colors and identity with hosted logo images
 * @param {string} userName - User's name
 * @param {string} verificationUrl - Email verification URL
 * @returns {string} HTML email template
 */
export const getEmailVerificationTemplate = (userName, verificationUrl) => {
  const logoDark = process.env.EMAIL_LOGO_DARK || '';
  const logoLight = process.env.EMAIL_LOGO_LIGHT || '';

  return `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تأكيد البريد الإلكتروني - مسار</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; direction: rtl;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f1f5f9;">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table role="presentation" style="width: 580px; max-width: 100%; border-collapse: collapse;">
            
            <!-- Top Logo Area -->
            <tr>
              <td align="center" style="padding: 0 0 24px 0;">
                <table role="presentation" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding-left: 14px; vertical-align: middle;">
                      <span style="font-size: 24px; font-weight: 700; color: #1e3a5f; letter-spacing: 0.5px;">Masar</span>
                      <span style="color: #cbd5e1; font-weight: 300; margin: 0 6px;">|</span>
                      <span style="font-size: 24px; font-weight: 700; color: #1e3a5f;">مسار</span>
                    </td>
                    <td style="vertical-align: middle;">
                      ${logoDark ? `<img src="${logoDark}" alt="Masar Logo" width="48" height="37" style="display: block;" />` : ''}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Main Card -->
            <tr>
              <td>
                <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(30, 58, 95, 0.08);">
                  
                  <!-- Header Banner -->
                  <tr>
                    <td style="background-color: #1e3a5f; background-image: linear-gradient(135deg, #1e3a5f 0%, #0d2137 100%); padding: 36px 32px 32px; text-align: center;">
                      <!-- Orange accent line -->
                      <div style="width: 50px; height: 4px; background-color: #f97316; border-radius: 2px; margin: 0 auto 20px;"></div>
                      
                      <!-- Light Logo in header -->
                      ${logoLight ? `
                      <div style="margin-bottom: 20px;">
                        <img src="${logoLight}" alt="Masar" width="72" height="55" style="display: inline-block;" />
                      </div>
                      ` : ''}
                      
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.3px;">
                        تأكيد البريد الإلكتروني
                      </h1>
                      <div style="width: 40px; height: 3px; background-color: #f97316; border-radius: 2px; margin: 16px auto 0;"></div>
                    </td>
                  </tr>
                  
                  <!-- Body Content -->
                  <tr>
                    <td style="padding: 36px 32px 20px;">
                      <!-- Greeting -->
                      <p style="color: #1e3a5f; font-size: 18px; margin: 0 0 6px 0; font-weight: 600;">
                        مرحباً ${userName} 👋
                      </p>
                      <p style="color: #64748b; font-size: 15px; line-height: 1.8; margin: 0 0 28px 0;">
                        شكراً لتسجيلك في منصة <strong style="color: #1e3a5f;">مسار</strong>! لإكمال عملية التسجيل وتفعيل حسابك، يرجى تأكيد بريدك الإلكتروني بالضغط على الزر أدناه.
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td align="center" style="padding: 8px 0 28px;">
                            <a href="${verificationUrl}" 
                               style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 15px 44px; border-radius: 12px; font-size: 16px; font-weight: 700; letter-spacing: 0.3px; mso-padding-alt: 0; text-align: center;">
                              <!--[if mso]><i style="letter-spacing: 44px; mso-font-width: -100%; mso-text-raise: 30pt;">&nbsp;</i><![endif]-->
                              <span style="mso-text-raise: 15pt;">✅ تأكيد البريد الإلكتروني</span>
                              <!--[if mso]><i style="letter-spacing: 44px; mso-font-width: -100%;">&nbsp;</i><![endif]-->
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Divider -->
                      <div style="border-top: 1px solid #e2e8f0; margin: 4px 0 24px;"></div>
                      
                      <!-- Info Box -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="background-color: #f0fdf4; border-radius: 12px; padding: 16px 18px; border-right: 4px solid #16a34a;">
                            <p style="color: #166534; font-size: 13px; margin: 0; line-height: 1.7;">
                              <strong>⏱️ ملاحظة:</strong> هذا الرابط صالح لمدة <strong>24 ساعة</strong>. إذا لم تقم بالتسجيل في منصة مسار، تجاهل هذا البريد.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Alternative Link Section -->
                  <tr>
                    <td style="padding: 0 32px 32px;">
                      <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 16px 0 6px 0;">
                        إذا لم يعمل الزر، انسخ الرابط التالي والصقه في المتصفح:
                      </p>
                      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; word-break: break-all; direction: ltr; text-align: left;">
                        <a href="${verificationUrl}" style="font-size: 11px; color: #2d5a8a; text-decoration: none; word-break: break-all;">${verificationUrl}</a>
                      </div>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 28px 20px 12px; text-align: center;">
                <!-- Footer Logo -->
                ${logoDark ? `
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td align="center" style="padding-bottom: 12px;">
                      <img src="${logoDark}" alt="Masar" width="36" height="28" style="display: inline-block; opacity: 0.6;" />
                    </td>
                  </tr>
                </table>
                ` : ''}
                <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px 0;">
                  © ${new Date().getFullYear()} <span style="color: #1e3a5f; font-weight: 600;">Masar | مسار</span> — جميع الحقوق محفوظة
                </p>
                <p style="color: #cbd5e1; font-size: 11px; margin: 6px 0 0 0;">
                  هذا البريد الإلكتروني تم إرساله تلقائيًا، لا ترد عليه.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

/**
 * Generate order approved email template
 * @param {string} userName - User's name
 * @param {string} courseName - Course name
 * @param {string} courseUrl - Course URL
 * @returns {string} HTML email template
 */
export const getOrderApprovedTemplate = (userName, courseName, courseUrl) => {
  const logoDark = process.env.EMAIL_LOGO_DARK || '';
  const logoLight = process.env.EMAIL_LOGO_LIGHT || '';

  return `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تمت الموافقة على طلبك - مسار</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; direction: rtl;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f1f5f9;">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table role="presentation" style="width: 580px; max-width: 100%; border-collapse: collapse;">
            
            <!-- Top Logo Area -->
            <tr>
              <td align="center" style="padding: 0 0 24px 0;">
                <table role="presentation" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding-left: 14px; vertical-align: middle;">
                      <span style="font-size: 24px; font-weight: 700; color: #1e3a5f; letter-spacing: 0.5px;">Masar</span>
                      <span style="color: #cbd5e1; font-weight: 300; margin: 0 6px;">|</span>
                      <span style="font-size: 24px; font-weight: 700; color: #1e3a5f;">مسار</span>
                    </td>
                    <td style="vertical-align: middle;">
                      ${logoDark ? `<img src="${logoDark}" alt="Masar Logo" width="48" height="37" style="display: block;" />` : ''}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Main Card -->
            <tr>
              <td>
                <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(30, 58, 95, 0.08);">
                  
                  <!-- Header Banner -->
                  <tr>
                    <td style="background-color: #16a34a; background-image: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 36px 32px 32px; text-align: center;">
                      <div style="width: 50px; height: 4px; background-color: #f97316; border-radius: 2px; margin: 0 auto 20px;"></div>
                      
                      ${logoLight ? `
                      <div style="margin-bottom: 20px;">
                        <img src="${logoLight}" alt="Masar" width="72" height="55" style="display: inline-block;" />
                      </div>
                      ` : ''}
                      
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.3px;">
                        🎉 تمت الموافقة على طلبك!
                      </h1>
                      <div style="width: 40px; height: 3px; background-color: #f97316; border-radius: 2px; margin: 16px auto 0;"></div>
                    </td>
                  </tr>
                  
                  <!-- Body Content -->
                  <tr>
                    <td style="padding: 36px 32px 20px;">
                      <p style="color: #1e3a5f; font-size: 18px; margin: 0 0 6px 0; font-weight: 600;">
                        مرحباً ${userName} 👋
                      </p>
                      <p style="color: #64748b; font-size: 15px; line-height: 1.8; margin: 0 0 28px 0;">
                        نبشرك بأنه تمت الموافقة على طلب شراء كورس <strong style="color: #1e3a5f;">"${courseName}"</strong>. يمكنك الآن البدء في رحلة التعلم!
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td align="center" style="padding: 8px 0 28px;">
                            <a href="${courseUrl}" 
                               style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 15px 44px; border-radius: 12px; font-size: 16px; font-weight: 700; letter-spacing: 0.3px; mso-padding-alt: 0; text-align: center;">
                              <span style="mso-text-raise: 15pt;">🚀 ابدأ التعلم الآن</span>
                            </a>
                          </td>
                        </tr>
                      </table>

                      <div style="border-top: 1px solid #e2e8f0; margin: 4px 0 24px;"></div>
                      
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="background-color: #f0fdf4; border-radius: 12px; padding: 16px 18px; border-right: 4px solid #16a34a;">
                            <p style="color: #166534; font-size: 13px; margin: 0; line-height: 1.7;">
                              <strong>💡 نصيحة:</strong> ننصحك بالبدء فوراً والالتزام بجدول تعلم منتظم للحصول على أفضل النتائج.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 28px 20px 12px; text-align: center;">
                ${logoDark ? `
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td align="center" style="padding-bottom: 12px;">
                      <img src="${logoDark}" alt="Masar" width="36" height="28" style="display: inline-block; opacity: 0.6;" />
                    </td>
                  </tr>
                </table>
                ` : ''}
                <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px 0;">
                  © ${new Date().getFullYear()} <span style="color: #1e3a5f; font-weight: 600;">Masar | مسار</span> — جميع الحقوق محفوظة
                </p>
                <p style="color: #cbd5e1; font-size: 11px; margin: 6px 0 0 0;">
                  هذا البريد الإلكتروني تم إرساله تلقائياً، لا ترد عليه.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

/**
 * Generate order rejected email template
 * @param {string} userName - User's name
 * @param {string} courseName - Course name
 * @param {string} rejectionReason - Reason for rejection
 * @returns {string} HTML email template
 */
export const getOrderRejectedTemplate = (userName, courseName, rejectionReason) => {
  const logoDark = process.env.EMAIL_LOGO_DARK || '';
  const logoLight = process.env.EMAIL_LOGO_LIGHT || '';

  return `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تحديث بشأن طلبك - مسار</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; direction: rtl;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f1f5f9;">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table role="presentation" style="width: 580px; max-width: 100%; border-collapse: collapse;">
            
            <tr>
              <td align="center" style="padding: 0 0 24px 0;">
                <table role="presentation" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding-left: 14px; vertical-align: middle;">
                      <span style="font-size: 24px; font-weight: 700; color: #1e3a5f; letter-spacing: 0.5px;">Masar</span>
                      <span style="color: #cbd5e1; font-weight: 300; margin: 0 6px;">|</span>
                      <span style="font-size: 24px; font-weight: 700; color: #1e3a5f;">مسار</span>
                    </td>
                    <td style="vertical-align: middle;">
                      ${logoDark ? `<img src="${logoDark}" alt="Masar Logo" width="48" height="37" style="display: block;" />` : ''}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td>
                <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(30, 58, 95, 0.08);">
                  
                  <tr>
                    <td style="background-color: #dc2626; background-image: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 36px 32px 32px; text-align: center;">
                      <div style="width: 50px; height: 4px; background-color: #f97316; border-radius: 2px; margin: 0 auto 20px;"></div>
                      
                      ${logoLight ? `
                      <div style="margin-bottom: 20px;">
                        <img src="${logoLight}" alt="Masar" width="72" height="55" style="display: inline-block;" />
                      </div>
                      ` : ''}
                      
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.3px;">
                        تحديث بشأن طلبك
                      </h1>
                      <div style="width: 40px; height: 3px; background-color: #f97316; border-radius: 2px; margin: 16px auto 0;"></div>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 36px 32px 20px;">
                      <p style="color: #1e3a5f; font-size: 18px; margin: 0 0 6px 0; font-weight: 600;">
                        مرحباً ${userName}
                      </p>
                      <p style="color: #64748b; font-size: 15px; line-height: 1.8; margin: 0 0 28px 0;">
                        نأسف لإبلاغك بأنه تم رفض طلب شراء كورس <strong style="color: #1e3a5f;">"${courseName}"</strong>.
                      </p>
                      
                      <div style="border-top: 1px solid #e2e8f0; margin: 4px 0 24px;"></div>
                      
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="background-color: #fef2f2; border-radius: 12px; padding: 16px 18px; border-right: 4px solid #dc2626;">
                            <p style="color: #991b1b; font-size: 13px; margin: 0 0 8px 0; font-weight: 600;">
                              سبب الرفض:
                            </p>
                            <p style="color: #7f1d1d; font-size: 13px; margin: 0; line-height: 1.7;">
                              ${rejectionReason}
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #64748b; font-size: 14px; line-height: 1.8; margin: 24px 0 0 0;">
                        يمكنك التواصل معنا للحصول على مزيد من التفاصيل أو إعادة المحاولة مع التأكد من صحة البيانات المرسلة.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 28px 20px 12px; text-align: center;">
                ${logoDark ? `
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td align="center" style="padding-bottom: 12px;">
                      <img src="${logoDark}" alt="Masar" width="36" height="28" style="display: inline-block; opacity: 0.6;" />
                    </td>
                  </tr>
                </table>
                ` : ''}
                <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px 0;">
                  © ${new Date().getFullYear()} <span style="color: #1e3a5f; font-weight: 600;">Masar | مسار</span> — جميع الحقوق محفوظة
                </p>
                <p style="color: #cbd5e1; font-size: 11px; margin: 6px 0 0 0;">
                  هذا البريد الإلكتروني تم إرساله تلقائياً، لا ترد عليه.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

/**
 * Generate certificate issued email template
 * @param {string} userName - User's name
 * @param {string} courseName - Course name
 * @param {string} certificateUrl - Certificate URL
 * @returns {string} HTML email template
 */
export const getCertificateIssuedTemplate = (userName, courseName, certificateUrl) => {
  const logoDark = process.env.EMAIL_LOGO_DARK || '';
  const logoLight = process.env.EMAIL_LOGO_LIGHT || '';

  return `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مبروك! تم إصدار شهادتك - مسار</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; direction: rtl;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f1f5f9;">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table role="presentation" style="width: 580px; max-width: 100%; border-collapse: collapse;">
            
            <tr>
              <td align="center" style="padding: 0 0 24px 0;">
                <table role="presentation" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding-left: 14px; vertical-align: middle;">
                      <span style="font-size: 24px; font-weight: 700; color: #1e3a5f; letter-spacing: 0.5px;">Masar</span>
                      <span style="color: #cbd5e1; font-weight: 300; margin: 0 6px;">|</span>
                      <span style="font-size: 24px; font-weight: 700; color: #1e3a5f;">مسار</span>
                    </td>
                    <td style="vertical-align: middle;">
                      ${logoDark ? `<img src="${logoDark}" alt="Masar Logo" width="48" height="37" style="display: block;" />` : ''}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td>
                <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(30, 58, 95, 0.08);">
                  
                  <tr>
                    <td style="background-color: #7c3aed; background-image: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 36px 32px 32px; text-align: center;">
                      <div style="width: 50px; height: 4px; background-color: #fbbf24; border-radius: 2px; margin: 0 auto 20px;"></div>
                      
                      ${logoLight ? `
                      <div style="margin-bottom: 20px;">
                        <img src="${logoLight}" alt="Masar" width="72" height="55" style="display: inline-block;" />
                      </div>
                      ` : ''}
                      
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.3px;">
                        🎓 مبروك! تم إصدار شهادتك
                      </h1>
                      <div style="width: 40px; height: 3px; background-color: #fbbf24; border-radius: 2px; margin: 16px auto 0;"></div>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 36px 32px 20px;">
                      <p style="color: #1e3a5f; font-size: 18px; margin: 0 0 6px 0; font-weight: 600;">
                        عزيزي ${userName} 🌟
                      </p>
                      <p style="color: #64748b; font-size: 15px; line-height: 1.8; margin: 0 0 28px 0;">
                        ألف مبروك! لقد أتممت بنجاح كورس <strong style="color: #1e3a5f;">"${courseName}"</strong> وتم إصدار شهادتك الرسمية.
                      </p>
                      
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td align="center" style="padding: 8px 0 28px;">
                            <a href="${certificateUrl}" 
                               style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 15px 44px; border-radius: 12px; font-size: 16px; font-weight: 700; letter-spacing: 0.3px; mso-padding-alt: 0; text-align: center;">
                              <span style="mso-text-raise: 15pt;">📥 تحميل الشهادة</span>
                            </a>
                          </td>
                        </tr>
                      </table>

                      <div style="border-top: 1px solid #e2e8f0; margin: 4px 0 24px;"></div>
                      
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="background-color: #faf5ff; border-radius: 12px; padding: 16px 18px; border-right: 4px solid #7c3aed;">
                            <p style="color: #5b21b6; font-size: 13px; margin: 0; line-height: 1.7;">
                              <strong>💡 نصيحة:</strong> شارك شهادتك على LinkedIn وأضفها إلى سيرتك الذاتية لتعزيز فرصك المهنية!
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 28px 20px 12px; text-align: center;">
                ${logoDark ? `
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td align="center" style="padding-bottom: 12px;">
                      <img src="${logoDark}" alt="Masar" width="36" height="28" style="display: inline-block; opacity: 0.6;" />
                    </td>
                  </tr>
                </table>
                ` : ''}
                <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px 0;">
                  © ${new Date().getFullYear()} <span style="color: #1e3a5f; font-weight: 600;">Masar | مسار</span> — جميع الحقوق محفوظة
                </p>
                <p style="color: #cbd5e1; font-size: 11px; margin: 6px 0 0 0;">
                  هذا البريد الإلكتروني تم إرساله تلقائياً، لا ترد عليه.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

export default sendEmail;
