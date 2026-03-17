/**
 * Seed categories, articles (110+) and comments (60+) into MongoDB.
 *
 * Usage:
 *   node seed-data.js           – insert (skip existing)
 *   node seed-data.js --reset   – drop & re-insert everything
 *
 * Requires: seed-accounts must be run first.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { articleTemplates, commentTemplates } = require('./seed-templates');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/papernews';

const categories = [
  { name: 'Trí tuệ nhân tạo', slug: 'ai', description: 'Tin tức và hướng dẫn về AI, Machine Learning, Deep Learning.' },
  { name: 'Lập trình', slug: 'programming', description: 'Ngôn ngữ lập trình, framework, kiến trúc phần mềm.' },
  { name: 'Bảo mật', slug: 'security', description: 'An ninh mạng, bảo mật ứng dụng, hacking & pentesting.' },
  { name: 'Khoa học dữ liệu', slug: 'data-science', description: 'Data Engineering, Analytics, Business Intelligence.' },
  { name: 'Blockchain', slug: 'blockchain', description: 'Crypto, DeFi, Smart Contracts, Web3.' },
  { name: 'Startup', slug: 'startup', description: 'Khởi nghiệp công nghệ, gọi vốn, growth.' },
  { name: 'Điện toán đám mây', slug: 'cloud', description: 'AWS, GCP, Azure, DevOps, Infrastructure.' },
  { name: 'Thiết kế UX/UI', slug: 'design', description: 'Trải nghiệm người dùng, thiết kế giao diện, design system.' },
  { name: 'Di động', slug: 'mobile', description: 'React Native, Flutter, iOS, Android, cross-platform.' },
  { name: 'Kinh tế số', slug: 'digital-economy', description: 'Fintech, E-commerce, Digital Transformation.' },
];

// Fake paragraph content generator—loops existing text for body
const LOREM_VN = [
  'Trong bối cảnh công nghệ phát triển nhanh chóng, việc cập nhật kiến thức là điều cần thiết cho mọi developer.',
  'Bài viết này sẽ hướng dẫn chi tiết từng bước, từ khái niệm cơ bản đến triển khai thực tế trong dự án.',
  'Theo khảo sát mới nhất từ Stack Overflow, các công nghệ này đang được sử dụng rộng rãi tại Việt Nam và trên thế giới.',
  'Chúng ta cần hiểu rõ trade-off giữa các lựa chọn để đưa ra quyết định phù hợp cho từng dự án cụ thể.',
  'Qua nhiều năm làm việc trong ngành, tôi nhận thấy rằng kiến thức nền tảng vững chắc là chìa khóa thành công.',
  'Performance và scalability luôn là hai yếu tố quan trọng khi thiết kế hệ thống production-grade.',
  'Bảo mật không phải là một tính năng add-on mà cần được tích hợp ngay từ giai đoạn thiết kế kiến trúc.',
  'Xu hướng mới cho thấy sự dịch chuyển mạnh mẽ sang cloud-native và serverless architecture.',
  'Việt Nam đang trở thành hub công nghệ quan trọng trong khu vực Đông Nam Á.',
  'Community và open-source đóng vai trò then chốt trong sự phát triển của ngành phần mềm.',
];

function generateContent(title, excerpt) {
  let content = `# ${title}\n\n${excerpt}\n\n`;
  // 6-10 paragraphs
  const numParagraphs = 6 + Math.floor(Math.random() * 5);
  for (let i = 0; i < numParagraphs; i++) {
    content += LOREM_VN[i % LOREM_VN.length] + '\n\n';
  }
  content += '## Kết luận\n\n' + LOREM_VN[4] + ' ' + LOREM_VN[9] + '\n';
  return content;
}

(async () => {
  const isReset = process.argv.includes('--reset');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const categoriesCol = db.collection('categories');
    const articlesCol = db.collection('articles');
    const commentsCol = db.collection('comments');
    const usersCol = db.collection('users');

    if (isReset) {
      console.log('\n🗑️  Resetting categories, articles, comments...');
      await categoriesCol.deleteMany({});
      await articlesCol.deleteMany({});
      await commentsCol.deleteMany({});
      console.log('   Done.');
    }

    // ─── Categories ──────────────────────────────
    console.log('\n📂 Seeding categories...');
    const catIds = [];
    for (const cat of categories) {
      const exists = await categoriesCol.findOne({ slug: cat.slug });
      if (exists) {
        catIds.push(exists._id);
        continue;
      }
      const result = await categoriesCol.insertOne({ ...cat, createdAt: new Date(), updatedAt: new Date() });
      catIds.push(result.insertedId);
      console.log(`   ✅ ${cat.name}`);
    }
    console.log(`   ${catIds.length} categories ready.`);

    // ─── Authors lookup ──────────────────────────
    const authors = await usersCol.find({ role: 'author' }).toArray();
    if (authors.length === 0) {
      console.error('\n❌ No authors found. Run seed-accounts.js first!');
      process.exit(1);
    }
    console.log(`\n👤 Found ${authors.length} authors.`);

    // ─── Articles ────────────────────────────────
    console.log('\n📰 Seeding articles...');
    const articleIds = [];
    const statuses = ['published', 'published', 'published', 'published', 'draft', 'pending'];

    for (let i = 0; i < articleTemplates.length; i++) {
      const [title, excerpt, catIdx, tags, isFeatured] = articleTemplates[i];
      const exists = await articlesCol.findOne({ title });
      if (exists) {
        articleIds.push(exists._id);
        continue;
      }

      const author = authors[i % authors.length];
      const daysAgo = Math.floor(Math.random() * 120);
      const publishedAt = new Date(Date.now() - daysAgo * 86400000);
      const status = statuses[i % statuses.length];

      const result = await articlesCol.insertOne({
        title,
        excerpt,
        content: generateContent(title, excerpt),
        category: catIds[catIdx],
        author: author._id,
        coverImage: '',
        tags,
        status,
        viewCount: Math.floor(Math.random() * 5000),
        bookmarkCount: Math.floor(Math.random() * 200),
        likeCount: Math.floor(Math.random() * 500),
        commentCount: 0,
        isFeatured,
        rejectReason: '',
        publishedAt: status === 'published' ? publishedAt : undefined,
        createdAt: publishedAt,
        updatedAt: publishedAt,
      });
      articleIds.push(result.insertedId);
    }
    console.log(`   ${articleIds.length} articles ready.`);

    // ─── Comments ────────────────────────────────
    console.log('\n💬 Seeding comments...');
    const allUsers = await usersCol.find({}).toArray();
    let commentCount = 0;

    // Spread 60+ comments across articles
    for (let i = 0; i < articleIds.length; i++) {
      const numComments = Math.random() < 0.4 ? 0 : (1 + Math.floor(Math.random() * 3));
      for (let j = 0; j < numComments; j++) {
        const commentUser = allUsers[Math.floor(Math.random() * allUsers.length)];
        const commentText = commentTemplates[(i + j) % commentTemplates.length];
        const daysAgo = Math.floor(Math.random() * 60);
        const createdAt = new Date(Date.now() - daysAgo * 86400000);

        await commentsCol.insertOne({
          article: articleIds[i],
          user: commentUser._id,
          content: commentText,
          createdAt,
          updatedAt: createdAt,
        });
        commentCount++;

        // Update article commentCount
        await articlesCol.updateOne({ _id: articleIds[i] }, { $inc: { commentCount: 1 } });
      }
    }
    console.log(`   ${commentCount} comments created.`);

    // ─── Follow / Bookmark relationships ─────────
    console.log('\n🔗 Creating follow & bookmark relationships...');
    for (const user of allUsers) {
      // Follow 2-5 random users
      const followCount = 2 + Math.floor(Math.random() * 4);
      const followIds = allUsers
        .filter(u => !u._id.equals(user._id))
        .sort(() => Math.random() - 0.5)
        .slice(0, followCount)
        .map(u => u._id);

      // Bookmark 1-5 random articles
      const bmCount = 1 + Math.floor(Math.random() * 5);
      const bmIds = articleIds
        .sort(() => Math.random() - 0.5)
        .slice(0, bmCount);

      await usersCol.updateOne({ _id: user._id }, {
        $set: { following: followIds, bookmarks: bmIds },
      });

      // Add to followers arrays
      for (const fId of followIds) {
        await usersCol.updateOne({ _id: fId }, { $addToSet: { followers: user._id } });
      }
    }
    console.log('   Done.');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎉 Seed complete!`);
    console.log(`   📂 ${catIds.length} categories`);
    console.log(`   📰 ${articleIds.length} articles`);
    console.log(`   💬 ${commentCount} comments`);
    console.log(`   👥 ${allUsers.length} users with relationships`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
