/**
 * Article templates for seed-data.js
 * Each entry: [title, excerpt, catIdx, tags, isFeatured]
 * authorIdx is assigned round-robin across authors (indices 2-16 in accounts)
 */
module.exports.articleTemplates = [
  // ── Trí tuệ nhân tạo (cat 0) ──
  ['GPT-5 và tương lai của trí tuệ nhân tạo tổng quát', 'Phân tích những đột phá mới nhất trong AGI và tác động đến ngành công nghệ Việt Nam.', 0, ['AI','GPT-5','AGI'], true],
  ['Hướng dẫn xây dựng RAG Pipeline với LangChain và Pinecone', 'Từng bước triển khai Retrieval-Augmented Generation cho ứng dụng thực tế.', 0, ['RAG','LangChain','AI'], false],
  ['Machine Learning với Python: Roadmap cho người mới', 'Lộ trình học Machine Learning từ cơ bản đến nâng cao.', 0, ['ML','Python','Roadmap'], false],
  ['Prompt Engineering nâng cao cho Developer', 'Kỹ thuật viết prompt hiệu quả cho coding assistant.', 0, ['Prompt','AI','LLM'], false],
  ['Fine-tuning LLM với LoRA và QLoRA', 'Hướng dẫn tinh chỉnh mô hình ngôn ngữ lớn chi phí thấp.', 0, ['LLM','LoRA','Fine-tuning'], true],
  ['Computer Vision 2025: Từ YOLO đến SAM 2', 'Tổng quan các model Computer Vision mới nhất.', 0, ['CV','YOLO','SAM'], false],
  ['AI Agent và tương lai tự động hóa', 'Xây dựng AI Agent với tool use và planning.', 0, ['Agent','AI','Automation'], false],
  ['Vector Database so sánh: Pinecone vs Weaviate vs Qdrant', 'Chọn vector DB phù hợp cho RAG pipeline.', 0, ['VectorDB','RAG','AI'], false],
  ['Multimodal AI: Khi máy hiểu cả hình, âm thanh và text', 'Ứng dụng multimodal trong thực tế.', 0, ['Multimodal','AI','Vision'], false],
  ['MLOps Pipeline: Từ experiment đến production', 'Triển khai ML model lên production với MLflow và Kubeflow.', 0, ['MLOps','Pipeline','ML'], false],
  ['Hugging Face Transformers: Thư viện AI phổ biến nhất', 'Hướng dẫn sử dụng Transformers cho NLP và CV.', 0, ['HuggingFace','NLP','AI'], false],
  ['AI trong Y tế: Chẩn đoán hình ảnh bằng Deep Learning', 'Ứng dụng AI trong phát hiện ung thư sớm.', 0, ['AI','Healthcare','DeepLearning'], true],

  // ── Lập trình (cat 1) ──
  ['Kiến trúc Microservices với Node.js và Kubernetes', 'Hướng dẫn thiết kế hệ thống microservices scalable.', 1, ['Microservices','K8s','Node.js'], false],
  ['TypeScript 5.5: Những tính năng mới đáng chú ý', 'Tổng hợp tính năng mới và breaking changes.', 1, ['TypeScript','JavaScript','Web'], false],
  ['WebAssembly: Tương lai ứng dụng web hiệu năng cao', 'WASM và ứng dụng game, video editing trên browser.', 1, ['WASM','Web','Performance'], false],
  ['Rust cho Backend: Tại sao nên chuyển từ Go?', 'So sánh Rust và Go cho hệ thống backend.', 1, ['Rust','Go','Backend'], false],
  ['Clean Architecture trong Node.js', 'Áp dụng SOLID và Clean Architecture cho Express.', 1, ['Architecture','Node.js','SOLID'], true],
  ['Python 3.13: Những thay đổi quan trọng', 'Free-threaded mode và JIT compiler.', 1, ['Python','Performance','Update'], false],
  ['GraphQL vs REST API: Khi nào chọn cái nào?', 'Phân tích ưu nhược điểm từ góc độ thực tiễn.', 1, ['GraphQL','REST','API'], false],
  ['Design Patterns phổ biến trong JavaScript', 'Singleton, Observer, Factory và hơn thế.', 1, ['JavaScript','Patterns','OOP'], false],
  ['Bun vs Deno vs Node.js: Runtime nào cho 2025?', 'Benchmark và so sánh chi tiết 3 JS runtime.', 1, ['Bun','Deno','Node.js'], false],
  ['Hệ thống Cache: Redis, Memcached và CDN', 'Chiến lược caching cho ứng dụng high-traffic.', 1, ['Redis','Cache','Performance'], false],
  ['Testing hiệu quả với Jest và Vitest', 'Unit test, integration test và TDD workflow.', 1, ['Testing','Jest','Vitest'], false],
  ['gRPC cho Microservices: Nhanh hơn REST 10x', 'Protocol Buffers và gRPC trong thực tế.', 1, ['gRPC','Microservices','Performance'], false],

  // ── Bảo mật (cat 2) ──
  ['Top 10 lỗ hổng bảo mật web phổ biến nhất 2025', 'OWASP Top 10 mới nhất và cách phòng chống.', 2, ['OWASP','Security','Web'], true],
  ['Zero Trust Architecture: Bảo mật không tin tưởng', 'Triển khai Zero Trust cho hạ tầng doanh nghiệp.', 2, ['ZeroTrust','Security','Enterprise'], false],
  ['SQL Injection trong 2025: Vẫn là mối đe dọa số 1', 'Phân tích các dạng SQLi và cách phòng chống.', 2, ['SQLi','Security','Web'], false],
  ['Pentesting API: Hướng dẫn toàn diện', 'Kiểm thử bảo mật REST API và GraphQL.', 2, ['Pentesting','API','Security'], false],
  ['Mã hóa End-to-End: Nguyên lý và triển khai', 'E2EE trong messaging app và file storage.', 2, ['Encryption','E2E','Privacy'], false],
  ['JWT Security Best Practices', 'Sai lầm phổ biến khi triển khai JWT auth.', 2, ['JWT','Auth','Security'], false],
  ['Container Security: Docker và Kubernetes', 'Hardening containers cho production.', 2, ['Docker','K8s','Security'], false],
  ['Bug Bounty: Hành trình kiếm $50K từ lỗ hổng', 'Chia sẻ kinh nghiệm bug bounty thực tế.', 2, ['BugBounty','Hacking','Security'], true],
  ['CORS Misconfiguration: Lỗi nhỏ, hậu quả lớn', 'Hiểu đúng về CORS và các lỗi thường gặp.', 2, ['CORS','Web','Security'], false],
  ['Supply Chain Attack: Khi npm package bị tấn công', 'Bảo vệ chuỗi cung ứng phần mềm.', 2, ['SupplyChain','npm','Security'], false],

  // ── Khoa học dữ liệu (cat 3) ──
  ['Data Pipeline hiện đại với Apache Kafka và dbt', 'Xử lý dữ liệu real-time và batch processing.', 3, ['Kafka','dbt','DataEng'], false],
  ['Apache Spark vs Polars: Xử lý big data 2025', 'So sánh performance và use cases.', 3, ['Spark','Polars','BigData'], false],
  ['Data Warehouse vs Data Lake vs Lakehouse', 'Kiến trúc dữ liệu hiện đại cho doanh nghiệp.', 3, ['Warehouse','Lake','Architecture'], false],
  ['SQL nâng cao: Window Functions và CTE', 'Kỹ thuật SQL không phải ai cũng biết.', 3, ['SQL','Analytics','Database'], false],
  ['Power BI vs Tableau vs Metabase', 'Chọn công cụ BI phù hợp cho team.', 3, ['BI','Visualization','Analytics'], false],
  ['Feature Engineering cho ML: A đến Z', 'Kỹ thuật tạo features tốt cho model.', 3, ['Feature','ML','Data'], true],
  ['Apache Airflow: Orchestrate everything', 'Quản lý data pipeline với Airflow.', 3, ['Airflow','Pipeline','Data'], false],
  ['Real-time Analytics với ClickHouse', 'Phân tích dữ liệu real-time tỷ bản ghi.', 3, ['ClickHouse','Analytics','OLAP'], false],
  ['Data Quality: Đảm bảo dữ liệu sạch', 'Great Expectations và data contracts.', 3, ['DataQuality','Testing','Data'], false],

  // ── Blockchain (cat 4) ──
  ['Blockchain và tương lai thanh toán số tại Việt Nam', 'Tiềm năng blockchain trong tài chính.', 4, ['Blockchain','Fintech','Crypto'], false],
  ['Smart Contract Security: Audit checklist', 'Kiểm tra bảo mật Solidity contracts.', 4, ['Solidity','Audit','Security'], false],
  ['DeFi 2025: Xu hướng và rủi ro', 'Phân tích thị trường DeFi năm nay.', 4, ['DeFi','Crypto','Finance'], false],
  ['Layer 2 Solutions: Rollup và Zero-Knowledge', 'Giải pháp mở rộng cho Ethereum.', 4, ['L2','ZK','Ethereum'], true],
  ['NFT Beyond Art: Ứng dụng thực tế', 'NFT trong gaming, real estate và identity.', 4, ['NFT','Web3','Gaming'], false],
  ['Tokenomics 101: Thiết kế token economy', 'Nguyên tắc thiết kế mô hình token.', 4, ['Tokenomics','Crypto','Design'], false],
  ['Web3 Social: Decentralized social media', 'Lens Protocol, Farcaster và tương lai.', 4, ['Web3','Social','Decentralized'], false],
  ['Move Language: Ngôn ngữ smart contract mới', 'So sánh Move (Sui/Aptos) với Solidity.', 4, ['Move','Sui','SmartContract'], false],

  // ── Startup (cat 5) ──
  ['Gọi vốn Series A: Bài học startup Việt', '5 bài học từ founder gọi vốn thành công.', 5, ['Startup','Fundraising','SeriesA'], true],
  ['Product-Market Fit: Làm sao biết đã đạt?', 'Framework đo lường PMF cho startup.', 5, ['PMF','Startup','Product'], false],
  ['Growth Hacking cho SaaS B2B', 'Chiến lược tăng trưởng chi phí thấp.', 5, ['Growth','SaaS','B2B'], false],
  ['Pitch Deck hoàn hảo: Template và tips', 'Cấu trúc pitch deck thuyết phục investor.', 5, ['Pitch','Startup','Investor'], false],
  ['Unit Economics: Hiểu rõ trước khi scale', 'CAC, LTV, Payback period cho startup.', 5, ['UnitEcon','Metrics','Startup'], false],
  ['Remote-first Company: Vận hành đội ngũ phân tán', 'Quản lý team remote hiệu quả.', 5, ['Remote','Management','Startup'], false],
  ['Lean Startup 2025: Còn phù hợp không?', 'Đánh giá lại phương pháp Lean Startup.', 5, ['Lean','Startup','Methodology'], false],
  ['Từ Side Project đến Startup triệu đô', 'Câu chuyện thực tế của founder Việt.', 5, ['SideProject','Startup','Story'], true],
  ['OKR cho Startup: Thiết lập mục tiêu đúng', 'Áp dụng OKR cho team nhỏ.', 5, ['OKR','Management','Startup'], false],
  ['Startup Legal 101: Thành lập công ty tech', 'Pháp lý cơ bản cho startup Việt.', 5, ['Legal','Startup','Vietnam'], false],

  // ── Điện toán đám mây (cat 6) ──
  ['AWS Lambda vs Google Cloud Run: Serverless 2025', 'So sánh hai nền tảng serverless hàng đầu.', 6, ['AWS','GCP','Serverless'], false],
  ['Kubernetes Operator Pattern', 'Tự động hóa vận hành với K8s Operators.', 6, ['K8s','Operator','DevOps'], false],
  ['Terraform vs Pulumi: IaC comparison', 'Infrastructure as Code cho cloud.', 6, ['Terraform','Pulumi','IaC'], false],
  ['Multi-cloud Strategy: AWS + GCP + Azure', 'Chiến lược đa đám mây cho enterprise.', 6, ['MultiCloud','Strategy','Enterprise'], false],
  ['Serverless PostgreSQL: Neon vs Supabase', 'Database serverless cho startup.', 6, ['Postgres','Serverless','Database'], true],
  ['CI/CD Pipeline với GitHub Actions', 'Tự động hóa build, test và deploy.', 6, ['CICD','GitHub','DevOps'], false],
  ['Monitoring với Prometheus và Grafana', 'Giám sát hệ thống production.', 6, ['Monitoring','Prometheus','Grafana'], false],
  ['Edge Computing: Xử lý tại biên mạng', 'CloudFlare Workers và Deno Deploy.', 6, ['Edge','Serverless','Performance'], false],
  ['Docker best practices cho production', 'Multi-stage builds và security.', 6, ['Docker','Container','DevOps'], false],
  ['Cost Optimization trên AWS', 'Tiết kiệm 40% chi phí cloud.', 6, ['AWS','Cost','Optimization'], false],

  // ── Thiết kế UX/UI (cat 7) ──
  ['Design System cho startup: Zero đến production', 'Xây dựng design system cho đội ngũ nhỏ.', 7, ['DesignSystem','UX','Figma'], false],
  ['Figma to Code: AI-powered design handoff', 'Chuyển đổi design sang code tự động.', 7, ['Figma','AI','Design'], false],
  ['Accessibility (A11y): Thiết kế cho mọi người', 'WCAG 2.2 guidelines thực hành.', 7, ['A11y','WCAG','Inclusive'], true],
  ['Motion Design: Micro-interactions', 'Animation nâng cao trải nghiệm UI.', 7, ['Animation','Motion','UI'], false],
  ['Dark Mode: Best practices và pitfalls', 'Triển khai dark mode đúng cách.', 7, ['DarkMode','UI','CSS'], false],
  ['Color Psychology trong Product Design', 'Tâm lý màu sắc ảnh hưởng UX.', 7, ['Color','Psychology','Design'], false],
  ['Typography cho Web: Chọn font đúng', 'Google Fonts, variable fonts và pairing.', 7, ['Typography','Font','Web'], false],
  ['Responsive Design 2025: Container Queries', 'CSS container queries và modern layout.', 7, ['Responsive','CSS','Layout'], false],

  // ── Di động (cat 8) ──
  ['React Native vs Flutter 2025', 'So sánh hai framework mobile phổ biến nhất.', 8, ['RN','Flutter','Mobile'], true],
  ['Expo Router v4: Migration guide', 'Nâng cấp Expo Router từ v3 lên v4.', 8, ['Expo','RN','Mobile'], false],
  ['SwiftUI 6: Những tính năng mới', 'Cập nhật SwiftUI cho iOS 19.', 8, ['SwiftUI','iOS','Apple'], false],
  ['Jetpack Compose vs XML Layout', 'Modern UI toolkit cho Android.', 8, ['Compose','Android','Kotlin'], false],
  ['App Performance: React Native optimization', 'Tối ưu hiệu năng RN app.', 8, ['RN','Performance','Mobile'], false],
  ['Push Notifications: FCM và APNs', 'Triển khai push notification hiệu quả.', 8, ['Push','FCM','Mobile'], false],
  ['Offline-first Mobile App Architecture', 'Xây dựng app hoạt động offline.', 8, ['Offline','Architecture','Mobile'], false],
  ['App Store Optimization (ASO) 2025', 'Tối ưu ranking trên App Store và Play Store.', 8, ['ASO','Marketing','Mobile'], false],
  ['Kotlin Multiplatform: Chia sẻ code iOS/Android', 'KMP thay thế cross-platform frameworks?', 8, ['KMP','Kotlin','CrossPlatform'], false],
  ['AR/VR Mobile: ARKit và ARCore', 'Phát triển ứng dụng thực tế ảo.', 8, ['AR','VR','Mobile'], false],

  // ── Kinh tế số (cat 9) ──
  ['Thương mại điện tử xuyên biên giới', 'Cơ hội xuất khẩu online cho SME Việt.', 9, ['Ecommerce','SME','Export'], false],
  ['Fintech Việt Nam: Bản đồ toàn cảnh 2025', 'Tổng quan hệ sinh thái fintech.', 9, ['Fintech','Vietnam','Map'], true],
  ['Digital Transformation cho doanh nghiệp vừa', 'Lộ trình chuyển đổi số thực tế.', 9, ['DX','Enterprise','Strategy'], false],
  ['Super App: Xu hướng hay bong bóng?', 'Phân tích mô hình super app tại SEA.', 9, ['SuperApp','SEA','Trend'], false],
  ['QR Payment: Thanh toán siêu tiện lợi', 'Thị trường thanh toán QR tại Việt Nam.', 9, ['QR','Payment','Vietnam'], false],
  ['EdTech Việt Nam: Cơ hội sau đại dịch', 'Giáo dục trực tuyến và AI tutoring.', 9, ['EdTech','Education','AI'], false],
  ['HealthTech: Công nghệ y tế số Việt Nam', 'Telemedicine và Health AI.', 9, ['HealthTech','Medical','Vietnam'], false],
  ['Creator Economy: Kiếm tiền từ nội dung', 'Monetization cho content creator.', 9, ['Creator','Content','Monetization'], false],
  ['AgriTech: Nông nghiệp thông minh', 'IoT và AI trong nông nghiệp Việt Nam.', 9, ['AgriTech','IoT','Agriculture'], false],
  ['PropTech: Bất động sản công nghệ', 'AI định giá và virtual tour.', 9, ['PropTech','RealEstate','AI'], false],
];

// Comment templates: [articleIdx, content]
module.exports.commentTemplates = [
  'Bài viết rất hay và chi tiết! Cảm ơn tác giả.',
  'Mình đã áp dụng và thấy hiệu quả rõ rệt.',
  'Có thể viết thêm phần nâng cao được không?',
  'Rất hữu ích cho dự án đang làm. Bookmarked!',
  'Phần so sánh rất khách quan và công bằng.',
  'Đã share cho team. Mọi người đều thích.',
  'Mình có ý kiến khác ở phần kết luận, nhưng overall rất tốt.',
  'Waiting for phần 2! 🔥',
  'Có thể bổ sung thêm code example không?',
  'Nội dung cập nhật, phù hợp xu hướng 2025.',
  'Đây chính xác là những gì mình đang tìm kiếm.',
  'Tác giả có kinh nghiệm thực tế, bài viết rất sâu.',
  'Mình newbie nhưng đọc vẫn hiểu được. Great job!',
  'So sánh rất rõ ràng, giúp mình quyết định nhanh hơn.',
  'Phần kiến trúc tổng quan rất trực quan.',
  'Đã thử theo hướng dẫn, chạy ngon lành.',
  'Mong tác giả viết thêm về chủ đề này.',
  'Cảm ơn đã giải thích dễ hiểu vậy!',
  'Mình đang gặp vấn đề tương tự, bài này giúp nhiều.',
  'Excellent! Chia sẻ góc nhìn rất mới mẻ.',
];
