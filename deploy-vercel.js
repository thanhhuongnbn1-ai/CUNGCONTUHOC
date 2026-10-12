import { execSync } from 'child_process';
import path from 'path';

/**
 * Tự động đồng bộ và triển khai dự án lên Vercel Production
 * Sử dụng Vercel Token do người dùng cung cấp hoặc từ biến môi trường
 */
const vercelToken = process.argv[2] || process.env.VERCEL_TOKEN;

if (!vercelToken) {
  console.log('------------------------------------------------------------');
  console.log('📌 HƯỚNG DẪN TỰ ĐỘNG KẾT NỐI VÀ ĐỒNG BỘ VERCEL:');
  console.log('1. Cách 1 (Khuyên dùng - Tự động 100% qua GitHub):');
  console.log('   - Vào https://vercel.com/new và chọn repo: thanhhuongnbn1-ai/CUNGCONTUHOC');
  console.log('   - Bấm "Deploy".');
  console.log('   - Kể từ đó, mỗi lần Agent push mã nguồn lên GitHub, Vercel sẽ tự động deploy!');
  console.log('\n2. Cách 2 (Deploy trực tiếp bằng lệnh):');
  console.log('   - Cung cấp Vercel Token: node deploy-vercel.js <VERCEL_TOKEN>');
  console.log('------------------------------------------------------------');
  process.exit(0);
}

console.log('🚀 Đang bắt đầu tự động triển khai lên Vercel Production...');
try {
  const output = execSync(`npx vercel --token ${vercelToken} --prod --yes`, {
    encoding: 'utf8',
    stdio: 'inherit'
  });
  console.log('\n🎉 TRIỂN KHAI VERCEL THÀNH CÔNG RỰC RỠ!');
} catch (err) {
  console.error('\n❌ Lỗi trong quá trình deploy Vercel:', err.message);
}
