import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Masar Logo - Dark version (navy strokes + orange road) for light backgrounds
const logoDarkSvg = `<svg width="260" height="200" viewBox="0 0 130 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 20V85" stroke="#1e3a5f" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 20L45 60" stroke="#1e3a5f" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M45 60L75 15" stroke="#1e3a5f" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M75 15L75 50" stroke="#1e3a5f" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M75 15L105 15" stroke="#1e3a5f" stroke-width="12" stroke-linecap="round"/>
  <path d="M95 5L108 15L95 25" stroke="#1e3a5f" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M14 80V22L46 56L78 16H104" stroke="#f97316" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="12 10" fill="none"/>
</svg>`;

// Masar Logo - Light version (white strokes + orange road) for dark backgrounds
const logoLightSvg = `<svg width="260" height="200" viewBox="0 0 130 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 20V85" stroke="#ffffff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 20L45 60" stroke="#ffffff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M45 60L75 15" stroke="#ffffff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M75 15L75 50" stroke="#ffffff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M75 15L105 15" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
  <path d="M95 5L108 15L95 25" stroke="#ffffff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M14 80V22L46 56L78 16H104" stroke="#f97316" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="12 10" fill="none"/>
</svg>`;

async function uploadLogo(svgContent, publicId) {
  const base64 = Buffer.from(svgContent).toString('base64');
  const dataUri = `data:image/svg+xml;base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    public_id: publicId,
    folder: 'e-learning/email',
    resource_type: 'image',
    overwrite: true,
  });

  // Return PNG URL (Cloudinary auto-converts SVG to PNG)
  return result.secure_url.replace('.svg', '.png');
}

async function main() {
  console.log('🚀 جاري رفع لوجو مسار على Cloudinary...\n');

  try {
    // Upload dark logo (for light backgrounds - top & footer)
    const darkUrl = await uploadLogo(logoDarkSvg, 'masar-logo-dark');
    console.log('✅ لوجو غامق (للخلفيات الفاتحة):');
    console.log(`   ${darkUrl}\n`);

    // Upload light logo (for dark backgrounds - header)
    const lightUrl = await uploadLogo(logoLightSvg, 'masar-logo-light');
    console.log('✅ لوجو فاتح (للخلفيات الغامقة):');
    console.log(`   ${lightUrl}\n`);

    // Auto-add to .env
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = fs.readFileSync(envPath, 'utf-8');

    // Remove old logo URLs if they exist
    envContent = envContent.replace(/\nEMAIL_LOGO_DARK=.*$/m, '');
    envContent = envContent.replace(/\nEMAIL_LOGO_LIGHT=.*$/m, '');

    // Append new URLs
    if (!envContent.endsWith('\n')) envContent += '\n';
    envContent += `EMAIL_LOGO_DARK=${darkUrl}\n`;
    envContent += `EMAIL_LOGO_LIGHT=${lightUrl}\n`;

    fs.writeFileSync(envPath, envContent);

    console.log('✅ تم حفظ الروابط في ملف .env بنجاح!');
    console.log('\n📌 أعد تشغيل السيرفر عشان التغييرات تتطبق:');
    console.log('   npm start');

  } catch (error) {
    console.error('❌ حصل خطأ:', error.message);
    process.exit(1);
  }
}

main();
