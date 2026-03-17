/**
 * Seed 50 accounts into MongoDB.
 *
 * Roles: 2 admins · 15 authors · 33 users
 * Password for ALL: 123456
 *
 * Usage:  node seed-accounts.js
 * Reset:  node seed-accounts.js --reset
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/papernews';

const accounts = [
  // ─── Admins (2) ───
  { name: 'Admin User',           email: 'admin@papernews.com',           role: 'admin',  bio: 'Quản trị viên hệ thống PaperNews.' },
  { name: 'Võ Ngọc Trâm',        email: 'tram.admin@papernews.com',      role: 'admin',  bio: 'Phó quản trị viên PaperNews, phụ trách nội dung.' },

  // ─── Authors (15) ───
  { name: 'Trần Minh Quân',      email: 'quan@papernews.com',            role: 'author', bio: 'Nhà báo công nghệ, 10 năm kinh nghiệm viết về AI và startup.' },
  { name: 'Nguyễn Thu Hà',       email: 'ha@papernews.com',              role: 'author', bio: 'Biên tập viên chuyên mục Kinh tế - Tài chính.' },
  { name: 'Lê Văn Đức',          email: 'duc@papernews.com',             role: 'author', bio: 'Chuyên gia An ninh mạng và bảo mật thông tin.' },
  { name: 'Phạm Quốc Bảo',      email: 'bao@papernews.com',             role: 'author', bio: 'Full-stack developer, đam mê chia sẻ kiến thức lập trình.' },
  { name: 'Hoàng Thị Lan',       email: 'lan@papernews.com',             role: 'author', bio: 'Data Scientist tại VinAI, chuyên viết về Machine Learning.' },
  { name: 'Đỗ Thanh Sơn',        email: 'son@papernews.com',             role: 'author', bio: 'DevOps Engineer, 8 năm kinh nghiệm cloud infrastructure.' },
  { name: 'Vũ Minh Tâm',         email: 'tam@papernews.com',             role: 'author', bio: 'Blockchain researcher, cựu kỹ sư tại Kyber Network.' },
  { name: 'Ngô Thành Trung',     email: 'trung@papernews.com',           role: 'author', bio: 'Mobile developer, co-founder startup EdTech.' },
  { name: 'Bùi Hồng Nhung',      email: 'nhung@papernews.com',           role: 'author', bio: 'UX/UI Designer tại Tiki, chuyên mục thiết kế sản phẩm.' },
  { name: 'Trương Đình Khoa',    email: 'khoa@papernews.com',            role: 'author', bio: 'Giảng viên CNTT, Đại học Bách khoa TP.HCM, nghiên cứu AI.' },
  { name: 'Lý Hoàng Phúc',       email: 'phuc@papernews.com',            role: 'author', bio: 'Startup founder, chuyên viết về growth hacking và marketing.' },
  { name: 'Mai Thị Hương',       email: 'huong.author@papernews.com',    role: 'author', bio: 'Tech lead tại FPT Software, chuyên microservices và DDD.' },
  { name: 'Đặng Văn Hải',        email: 'hai@papernews.com',             role: 'author', bio: 'IoT/Embedded engineer, đam mê phần cứng và robotics.' },
  { name: 'Phan Nhật Minh',      email: 'minh.author@papernews.com',     role: 'author', bio: 'Game developer, Unity expert, 6 năm kinh nghiệm.' },

  // ─── Users (33) ───
  { name: 'Phạm Thanh Mai',      email: 'mai@papernews.com',             role: 'user',   bio: 'Độc giả yêu thích công nghệ và khoa học.' },
  { name: 'Nguyễn Hoàng Long',   email: 'long@papernews.com',            role: 'user',   bio: 'Sinh viên CNTT năm 4, đam mê backend development.' },
  { name: 'Trần Thị Ngọc Ánh',   email: 'anh@papernews.com',             role: 'user',   bio: 'Frontend developer junior tại Viettel.' },
  { name: 'Lê Quang Huy',        email: 'huy@papernews.com',             role: 'user',   bio: 'Freelancer lập trình web, thích đọc tin công nghệ.' },
  { name: 'Võ Minh Khang',       email: 'khang@papernews.com',           role: 'user',   bio: 'QA tester, quan tâm đến automation testing.' },
  { name: 'Đào Thị Bích Ngọc',   email: 'ngoc@papernews.com',            role: 'user',   bio: 'Product manager tại Shopee, yêu thích phân tích dữ liệu.' },
  { name: 'Hoàng Đức Anh',       email: 'ducanh@papernews.com',          role: 'user',   bio: 'DevOps intern, đang học Kubernetes.' },
  { name: 'Nguyễn Văn Tùng',     email: 'tung@papernews.com',            role: 'user',   bio: 'Java developer, 3 năm kinh nghiệm Spring Boot.' },
  { name: 'Phạm Thị Hồng Vân',   email: 'van@papernews.com',             role: 'user',   bio: 'UI/UX fresher, đam mê thiết kế sản phẩm.' },
  { name: 'Trần Đình Phong',     email: 'phong@papernews.com',           role: 'user',   bio: 'Kỹ sư phần mềm tại Samsung Vietnam.' },
  { name: 'Lê Thị Mỹ Duyên',    email: 'duyen@papernews.com',           role: 'user',   bio: 'Content writer chuyển sang học coding.' },
  { name: 'Bùi Văn Thắng',       email: 'thang@papernews.com',           role: 'user',   bio: 'SRE tại MoMo, quan tâm đến observability.' },
  { name: 'Ngô Thị Thanh Thảo',  email: 'thao@papernews.com',            role: 'user',   bio: 'Data analyst, yêu thích SQL và Python.' },
  { name: 'Vũ Đức Mạnh',         email: 'manh@papernews.com',            role: 'user',   bio: 'React Native developer tại ZaloPay.' },
  { name: 'Đỗ Hồng Quang',       email: 'quang@papernews.com',           role: 'user',   bio: 'Sinh viên năm 3, thích nghiên cứu blockchain.' },
  { name: 'Mai Xuân Trường',     email: 'truong@papernews.com',          role: 'user',   bio: 'Back-end developer Go, thích high performance.' },
  { name: 'Phan Thị Diệu Linh', email: 'linh@papernews.com',            role: 'user',   bio: 'HR tech recruiter, quan tâm đến xu hướng IT.' },
  { name: 'Trương Minh Tuấn',    email: 'tuan@papernews.com',            role: 'user',   bio: 'System admin Linux, 5 năm kinh nghiệm.' },
  { name: 'Lý Thị Kim Ngân',    email: 'ngan@papernews.com',            role: 'user',   bio: 'QA lead tại VNPAY, đam mê testing automation.' },
  { name: 'Đặng Quốc Việt',      email: 'viet@papernews.com',            role: 'user',   bio: 'Embedded developer, đang chuyển sang IoT.' },
  { name: 'Huỳnh Thị Phương',    email: 'phuong@papernews.com',          role: 'user',   bio: 'Marketing tại startup SaaS, yêu thích No-code.' },
  { name: 'Nguyễn Tấn Phát',     email: 'phat@papernews.com',            role: 'user',   bio: 'Flutter developer, 2 năm kinh nghiệm mobile.' },
  { name: 'Trần Hữu Nghĩa',     email: 'nghia@papernews.com',           role: 'user',   bio: 'Cloud architect tại FPT Cloud.' },
  { name: 'Lê Ngọc Khánh',       email: 'khanh@papernews.com',           role: 'user',   bio: 'Sinh viên CNTT, đang tìm hiểu Machine Learning.' },
  { name: 'Võ Thị Hạnh',         email: 'hanh@papernews.com',            role: 'user',   bio: 'Project manager, chuyên agile/scrum.' },
  { name: 'Hoàng Trọng Nghĩa',   email: 'nghia2@papernews.com',          role: 'user',   bio: 'Security researcher, thích CTF.' },
  { name: 'Phạm Hữu Đạt',       email: 'dat@papernews.com',             role: 'user',   bio: 'Full-stack developer Next.js + NestJS.' },
  { name: 'Ngô Quang Thịnh',     email: 'thinh@papernews.com',           role: 'user',   bio: 'Game modder, đang học Unreal Engine.' },
  { name: 'Bùi Thị Thu Hương',   email: 'huong@papernews.com',           role: 'user',   bio: 'Business analyst, quan tâm đến digital transformation.' },
  { name: 'Trần Minh Châu',      email: 'chau@papernews.com',            role: 'user',   bio: 'iOS developer Swift, fan Apple.' },
  { name: 'Đỗ Văn Lâm',          email: 'lam@papernews.com',             role: 'user',   bio: 'ML engineer tại Cốc Cốc, chuyên NLP.' },
  { name: 'Vũ Thị Ngọc Mai',     email: 'ngocmai@papernews.com',         role: 'user',   bio: 'Technical writer, đam mê documentation.' },
];

(async () => {
  const isReset = process.argv.includes('--reset');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCol = db.collection('users');

    if (isReset) {
      console.log('🗑️  Resetting all users...');
      await usersCol.deleteMany({});
      console.log('   Done.\n');
    }

    let created = 0;
    let skipped = 0;
    const hashed = await bcrypt.hash('123456', 12);

    for (let i = 0; i < accounts.length; i++) {
      const acc = accounts[i];
      const exists = await usersCol.findOne({ email: acc.email });
      if (exists) {
        skipped++;
        continue;
      }

      // Spread creation dates over last 6 months
      const daysAgo = Math.floor(Math.random() * 180);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      await usersCol.insertOne({
        name: acc.name,
        email: acc.email,
        password: hashed,
        role: acc.role,
        bio: acc.bio,
        avatarUrl: '',
        isVerified: true,
        isBanned: false,
        bookmarks: [],
        likes: [],
        following: [],
        followers: [],
        createdAt,
        updatedAt: createdAt,
      });
      created++;
      console.log(`   ✅ ${acc.email} (${acc.role})`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎉 Done! ${created} created, ${skipped} skipped`);
    console.log(`   👥 Total accounts: ${accounts.length}`);
    console.log('   🔑 Password for all: 123456');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
