import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const curriculumDir = resolve(scriptDir, '../src/main/resources/curriculum');
const checkedAt = '2026-07-15';

const media = {
  hello: image('hello.png', 1280, 853, 'Các bạn nhỏ chào nhau'),
  body: image('body.png', 1280, 1214, 'Minh họa cơ thể người'),
  family: image('family.jpg', 1280, 853, 'Gia đình vui vẻ bên nhau'),
  birthday: image('birthday.jpg', 1280, 853, 'Các bạn nhỏ dự tiệc sinh nhật'),
  food: image('food.jpg', 1280, 853, 'Bạn nhỏ và các món ăn'),
  home: image('home.png', 1280, 1280, 'Các bạn nhỏ ở gần ngôi nhà'),
  school: image('school.jpg', 1280, 853, 'Các bạn nhỏ ở trường học'),
  zoo: image('zoo.png', 1100, 1224, 'Các con vật ở sở thú'),
  beach: image('beach.jpg', 996, 1280, 'Bạn nhỏ vui chơi ở bãi biển'),
  street: image('street.jpg', 1280, 1280, 'Các bạn nhỏ trên đường phố'),
};

const levels = [
  {
    folder: 'starters-v4', versionCode: 'STARTERS_2026.4', levelCode: 'PRE_A1_STARTERS',
    title: 'Pre A1 Starters - Những bước đầu tiên', prefix: 'STARTERS',
    description: '25 bài học nền tảng giúp trẻ nhận biết từ quen thuộc, hiểu câu ngắn và tự tin giao tiếp đơn giản.',
    wordlistUrl: 'https://www.cambridgeenglish.org/images/351849-pre-a1-starters-wordlist-picture-book.pdf',
    formatUrl: 'https://www.cambridgeenglish.org/exams-and-tests/qualifications/young-learners/paper/starters/format/',
    overviewUrl: 'https://www.cambridgeenglish.org/exams-and-tests/qualifications/young-learners/paper/starters/',
    units: [
      unit('Em và cơ thể', 'Chào hỏi, giới thiệu bản thân, gọi tên cơ thể, quần áo và cảm xúc.', 'hello', [
        lesson('Hello and Me', 'Chào hỏi, nói tên và tuổi bằng câu ngắn.', { hello: 'xin chào', goodbye: 'tạm biệt', name: 'tên', old: 'tuổi' }, 'Hello, my name is Ben.'),
        lesson('My Body', 'Gọi tên các bộ phận cơ thể quen thuộc.', { head: 'đầu', hand: 'bàn tay', foot: 'bàn chân', body: 'cơ thể' }, 'This is my hand.'),
        lesson('My Face', 'Nhận biết và mô tả các bộ phận trên khuôn mặt.', { eye: 'mắt', ear: 'tai', nose: 'mũi', mouth: 'miệng' }, 'I have two eyes.'),
        lesson('My Clothes', 'Gọi tên quần áo và nói màu sắc.', { shirt: 'áo sơ mi', dress: 'váy liền', trousers: 'quần dài', shoes: 'giày' }, 'My shirt is blue.'),
        lesson('My Feelings', 'Nói cảm xúc cơ bản của bản thân.', { happy: 'vui', sad: 'buồn', tired: 'mệt', hungry: 'đói' }, 'I am happy today.'),
      ]),
      unit('Gia đình và bạn bè', 'Nói về gia đình, bạn bè, sinh nhật, đồ chơi, màu sắc và số đếm.', 'family', [
        lesson('My Family', 'Gọi tên những người thân trong gia đình.', { mother: 'mẹ', father: 'bố', sister: 'chị hoặc em gái', brother: 'anh hoặc em trai' }, 'This is my family.'),
        lesson('My Friends', 'Giới thiệu và miêu tả một người bạn.', { friend: 'bạn', boy: 'bé trai', girl: 'bé gái', funny: 'vui tính' }, 'She is my friend.'),
        lesson('Happy Birthday', 'Dùng từ vựng quen thuộc trong một buổi sinh nhật.', { birthday: 'sinh nhật', cake: 'bánh ngọt', present: 'quà tặng', balloon: 'bóng bay' }, 'This cake is for you.'),
        lesson('Toys and Games', 'Gọi tên đồ chơi và nói món đồ mình có.', { ball: 'quả bóng', doll: 'búp bê', kite: 'diều', game: 'trò chơi' }, 'I have a red ball.'),
        lesson('Colours and Numbers', 'Kết hợp màu sắc với số đếm từ một đến mười.', { red: 'màu đỏ', blue: 'màu xanh dương', green: 'màu xanh lá', yellow: 'màu vàng' }, 'I can see three red kites.'),
      ]),
      unit('Món ngon và ngôi nhà', 'Hỏi đáp về đồ ăn, thức uống, căn phòng và đồ vật trong nhà.', 'food', [
        lesson('Favourite Food', 'Nói món ăn mình thích hoặc không thích.', { apple: 'quả táo', banana: 'quả chuối', bread: 'bánh mì', rice: 'cơm' }, 'I like apples.'),
        lesson('Drinks and Snacks', 'Gọi tên thức uống và món ăn nhẹ.', { water: 'nước', milk: 'sữa', juice: 'nước ép', cake: 'bánh ngọt' }, 'Can I have some juice?'),
        lesson('At Home', 'Gọi tên các căn phòng trong nhà.', { house: 'ngôi nhà', bedroom: 'phòng ngủ', kitchen: 'nhà bếp', bathroom: 'phòng tắm' }, 'The kitchen is in my house.'),
        lesson('My Bedroom', 'Nói vị trí đồ vật quen thuộc trong phòng ngủ.', { bed: 'giường', lamp: 'đèn', table: 'bàn', chair: 'ghế' }, 'The lamp is on the table.'),
        lesson('In the Kitchen', 'Nhận biết đồ dùng và thực phẩm trong bếp.', { cup: 'cốc', plate: 'đĩa', spoon: 'thìa', egg: 'quả trứng' }, 'The egg is on the plate.'),
      ]),
      unit('Trường học và muông thú', 'Khám phá lớp học, ngày đi học, thú cưng và động vật ở sở thú.', 'school', [
        lesson('At School', 'Gọi tên người và nơi chốn ở trường.', { school: 'trường học', teacher: 'giáo viên', pupil: 'học sinh', classroom: 'lớp học' }, 'My teacher is in the classroom.'),
        lesson('Classroom Things', 'Gọi tên đồ dùng học tập quen thuộc.', { book: 'sách', pen: 'bút mực', pencil: 'bút chì', ruler: 'thước kẻ' }, 'The pencil is in my bag.'),
        lesson('My School Day', 'Hiểu các hoạt động đơn giản ở trường.', { read: 'đọc', write: 'viết', draw: 'vẽ', listen: 'lắng nghe' }, 'We read a book at school.'),
        lesson('My Pets', 'Gọi tên và mô tả thú cưng.', { cat: 'con mèo', dog: 'con chó', fish: 'con cá', bird: 'con chim' }, 'My dog is small.'),
        lesson('At the Zoo', 'Gọi tên một số động vật hoang dã.', { lion: 'sư tử', elephant: 'voi', monkey: 'khỉ', crocodile: 'cá sấu' }, 'The elephant is big.'),
      ]),
      unit('Thế giới quanh em', 'Nói về bãi biển, đường phố, công viên, phương tiện và trò chơi.', 'beach', [
        lesson('At the Beach', 'Gọi tên sự vật và hoạt động ở bãi biển.', { beach: 'bãi biển', sea: 'biển', sand: 'cát', shell: 'vỏ sò' }, 'I can see a shell on the sand.'),
        lesson('My Street', 'Nhận biết địa điểm gần nhà.', { street: 'đường phố', shop: 'cửa hàng', house: 'ngôi nhà', tree: 'cây' }, 'The shop is on my street.'),
        lesson('At the Park', 'Nói về hoạt động vui chơi trong công viên.', { park: 'công viên', run: 'chạy', jump: 'nhảy', play: 'chơi' }, 'We play in the park.'),
        lesson('Let Us Travel', 'Gọi tên các phương tiện quen thuộc.', { car: 'ô tô', bus: 'xe buýt', bike: 'xe đạp', boat: 'thuyền' }, 'I go by bus.'),
        lesson('Starters Challenge', 'Ôn từ và câu quan trọng của cấp độ Starters.', { answer: 'trả lời', question: 'câu hỏi', look: 'nhìn', say: 'nói' }, 'Look at the picture and answer.'),
      ]),
    ],
  },
  {
    folder: 'movers-v1', versionCode: 'MOVERS_2026.1', levelCode: 'A1_MOVERS',
    title: 'A1 Movers - Tự tin mỗi ngày', prefix: 'MOVERS',
    description: '25 bài học giúp trẻ hỏi đáp về đời sống, mô tả hành động, hiểu thông tin chi tiết và kể chuyện ngắn.',
    wordlistUrl: 'https://www.cambridgeenglish.org/images/351850-a1-movers-word-list-2018.pdf',
    formatUrl: 'https://www.cambridgeenglish.org/exams-and-tests/qualifications/young-learners/paper/movers/format/',
    overviewUrl: 'https://www.cambridgeenglish.org/exams-and-tests/qualifications/young-learners/paper/movers/',
    units: [
      unit('Cuộc sống mỗi ngày', 'Luyện thói quen, giờ giấc, ngày trong tuần và hoạt động cuối tuần.', 'hello', [
        lesson('A New Day', 'Mô tả những việc thường làm trong ngày.', { wake: 'thức dậy', wash: 'rửa', dress: 'mặc quần áo', breakfast: 'bữa sáng' }, 'I wake up before breakfast.'),
        lesson('Morning Routine', 'Nói thứ tự các hoạt động buổi sáng.', { first: 'đầu tiên', then: 'sau đó', before: 'trước', after: 'sau' }, 'First I wash, then I get dressed.'),
        lesson('After School', 'Hỏi đáp về hoạt động sau giờ học.', { homework: 'bài tập về nhà', library: 'thư viện', practise: 'luyện tập', home: 'nhà' }, 'I do my homework after school.'),
        lesson('Fun Weekends', 'Kể về hoạt động cuối tuần.', { weekend: 'cuối tuần', picnic: 'chuyến dã ngoại', cinema: 'rạp chiếu phim', visit: 'thăm' }, 'We visited our grandparents at the weekend.'),
        lesson('Time and Dates', 'Đọc giờ và nói ngày tháng cơ bản.', { clock: 'đồng hồ', hour: 'giờ', date: 'ngày tháng', calendar: 'lịch' }, 'The lesson starts at nine o clock.'),
      ]),
      unit('Con người và thành phố', 'Tìm hiểu nghề nghiệp, bạn bè, mua sắm, địa điểm và chỉ đường.', 'street', [
        lesson('Family Jobs', 'Nói về công việc của người thân.', { doctor: 'bác sĩ', nurse: 'y tá', farmer: 'nông dân', driver: 'tài xế' }, 'My aunt works as a doctor.'),
        lesson('Good Friends', 'Miêu tả ngoại hình và tính cách bạn bè.', { kind: 'tốt bụng', clever: 'thông minh', curly: 'xoăn', quiet: 'yên lặng' }, 'My friend is kind and clever.'),
        lesson('Around Town', 'Gọi tên và nói chức năng địa điểm trong thị trấn.', { hospital: 'bệnh viện', station: 'nhà ga', market: 'chợ', library: 'thư viện' }, 'You can borrow books at the library.'),
        lesson('Going Shopping', 'Hỏi giá và chọn đồ khi mua sắm.', { buy: 'mua', price: 'giá', money: 'tiền', expensive: 'đắt' }, 'How much does this bag cost?'),
        lesson('Finding the Way', 'Hiểu và đưa chỉ dẫn đơn giản.', { straight: 'thẳng', corner: 'góc đường', across: 'băng qua', opposite: 'đối diện' }, 'Go straight and turn at the corner.'),
      ]),
      unit('Thiên nhiên và động vật', 'Mô tả động vật, thời tiết, mùa và vùng nông thôn.', 'zoo', [
        lesson('Wild Animals', 'Mô tả nơi sống và đặc điểm của động vật.', { jungle: 'rừng nhiệt đới', camel: 'lạc đà', dolphin: 'cá heo', dangerous: 'nguy hiểm' }, 'Dolphins live in the sea.'),
        lesson('Weather Today', 'Hỏi đáp và mô tả thời tiết.', { cloudy: 'nhiều mây', windy: 'nhiều gió', storm: 'bão', temperature: 'nhiệt độ' }, 'It is cloudy and windy today.'),
        lesson('Four Seasons', 'So sánh hoạt động ở các mùa.', { spring: 'mùa xuân', summer: 'mùa hè', autumn: 'mùa thu', winter: 'mùa đông' }, 'Winter is colder than autumn.'),
        lesson('In the Countryside', 'Nói về cảnh vật và hoạt động ở nông thôn.', { field: 'cánh đồng', village: 'làng', river: 'sông', tractor: 'máy kéo' }, 'A tractor is moving across the field.'),
        lesson('Care for Nature', 'Nói những hành động đơn giản để giữ môi trường sạch.', { clean: 'sạch', rubbish: 'rác', plant: 'trồng', recycle: 'tái chế' }, 'We should put rubbish in the bin.'),
      ]),
      unit('Sức khỏe và sở thích', 'Luyện thể thao, sở thích, thực phẩm lành mạnh và lời khuyên.', 'food', [
        lesson('Sports Day', 'Nói về môn thể thao và khả năng.', { basketball: 'bóng rổ', skate: 'trượt ván', race: 'cuộc đua', team: 'đội' }, 'Our team won the basketball game.'),
        lesson('My Hobbies', 'Hỏi đáp về sở thích và tần suất.', { hobby: 'sở thích', collect: 'sưu tầm', dance: 'nhảy múa', usually: 'thường xuyên' }, 'I usually collect stamps after school.'),
        lesson('Healthy Food', 'Phân biệt và lựa chọn thức ăn lành mạnh.', { healthy: 'lành mạnh', vegetable: 'rau', fruit: 'trái cây', sugar: 'đường' }, 'Vegetables are healthier than sweets.'),
        lesson('At the Doctor', 'Mô tả triệu chứng đơn giản.', { headache: 'đau đầu', stomach: 'bụng', medicine: 'thuốc', ill: 'ốm' }, 'I have a headache and feel ill.'),
        lesson('Feelings and Advice', 'Nói cảm xúc và đưa lời khuyên ngắn.', { worried: 'lo lắng', excited: 'hào hứng', afraid: 'sợ', should: 'nên' }, 'You should talk to your teacher.'),
      ]),
      unit('Câu chuyện và chuyến đi', 'Kể sự kiện trong quá khứ, nói về kỳ nghỉ và ôn kỹ năng Movers.', 'beach', [
        lesson('Yesterday', 'Dùng động từ quá khứ trong câu ngắn.', { yesterday: 'hôm qua', watched: 'đã xem', played: 'đã chơi', walked: 'đã đi bộ' }, 'Yesterday we walked to the park.'),
        lesson('A Holiday Trip', 'Kể về một chuyến đi nghỉ.', { holiday: 'kỳ nghỉ', hotel: 'khách sạn', suitcase: 'va li', journey: 'hành trình' }, 'We stayed in a hotel near the beach.'),
        lesson('Transport Stories', 'Mô tả chuyến đi bằng phương tiện khác nhau.', { passenger: 'hành khách', ticket: 'vé', platform: 'sân ga', airport: 'sân bay' }, 'The passengers waited on the platform.'),
        lesson('Tell a Short Story', 'Sắp xếp và kể một câu chuyện ngắn.', { suddenly: 'đột nhiên', next: 'tiếp theo', finally: 'cuối cùng', happened: 'đã xảy ra' }, 'Suddenly it rained, but finally the sun came out.'),
        lesson('Movers Challenge', 'Ôn mô tả, hỏi đáp và kể chuyện ở cấp độ Movers.', { describe: 'mô tả', difference: 'điểm khác nhau', story: 'câu chuyện', explain: 'giải thích' }, 'Describe the difference between the pictures.'),
      ]),
    ],
  },
  {
    folder: 'flyers-v1', versionCode: 'FLYERS_2026.1', levelCode: 'A2_FLYERS',
    title: 'A2 Flyers - Bay xa cùng tiếng Anh', prefix: 'FLYERS',
    description: '25 bài học giúp trẻ liên kết câu, trao đổi thông tin, nêu lý do và viết hoặc kể những câu chuyện ngắn.',
    wordlistUrl: 'https://www.cambridgeenglish.org/images/351851-a2-flyers-wordlist-picture-book.pdf',
    formatUrl: 'https://www.cambridgeenglish.org/exams-and-tests/qualifications/young-learners/paper/flyers/format/',
    overviewUrl: 'https://www.cambridgeenglish.org/exams-and-tests/qualifications/young-learners/paper/flyers/',
    units: [
      unit('Thế giới đang lớn', 'Khám phá tính cách, môn học, công nghệ, nghề nghiệp và kế hoạch tương lai.', 'school', [
        lesson('My Personality', 'Mô tả tính cách bằng nhiều đặc điểm.', { friendly: 'thân thiện', patient: 'kiên nhẫn', polite: 'lịch sự', confident: 'tự tin' }, 'I am friendly, but I can be quiet with new people.'),
        lesson('School Subjects', 'Nêu sở thích và lý do về môn học.', { science: 'khoa học', history: 'lịch sử', geography: 'địa lý', language: 'ngôn ngữ' }, 'Science is my favourite subject because I enjoy experiments.'),
        lesson('Technology Around Us', 'Nói cách sử dụng thiết bị quen thuộc.', { screen: 'màn hình', keyboard: 'bàn phím', online: 'trực tuyến', information: 'thông tin' }, 'I use a keyboard to search for information online.'),
        lesson('Jobs and Skills', 'Liên hệ nghề nghiệp với kỹ năng cần thiết.', { engineer: 'kỹ sư', journalist: 'nhà báo', mechanic: 'thợ máy', photographer: 'nhiếp ảnh gia' }, 'A journalist writes reports and asks people questions.'),
        lesson('Future Plans', 'Nói dự định và ước mơ tương lai.', { future: 'tương lai', plan: 'kế hoạch', hope: 'hy vọng', decide: 'quyết định' }, 'I hope I will travel and learn another language.'),
      ]),
      unit('Kết nối và sẻ chia', 'Luyện tin nhắn, lời mời, ý kiến, giải quyết vấn đề và tin tức.', 'hello', [
        lesson('Messages and Emails', 'Đọc và viết thông điệp ngắn rõ ràng.', { message: 'tin nhắn', email: 'thư điện tử', reply: 'trả lời', address: 'địa chỉ' }, 'Please reply to my message when you arrive.'),
        lesson('Invitations', 'Mời, chấp nhận hoặc từ chối lịch sự.', { invite: 'mời', accept: 'chấp nhận', refuse: 'từ chối', available: 'rảnh' }, 'I would love to come, but I am not available on Friday.'),
        lesson('Sharing Opinions', 'Nêu ý kiến và giải thích lý do.', { opinion: 'ý kiến', agree: 'đồng ý', disagree: 'không đồng ý', reason: 'lý do' }, 'I agree because the new playground is safer.'),
        lesson('Problems and Solutions', 'Mô tả vấn đề và đề xuất giải pháp.', { problem: 'vấn đề', solution: 'giải pháp', repair: 'sửa chữa', choose: 'lựa chọn' }, 'We could repair the bike instead of buying a new one.'),
        lesson('News and Reports', 'Nhận biết thông tin chính trong một bản tin ngắn.', { news: 'tin tức', report: 'bản tin', event: 'sự kiện', interview: 'phỏng vấn' }, 'The report explains what happened at the school event.'),
      ]),
      unit('Khoa học và thiên nhiên', 'Tìm hiểu không gian, môi trường, môi trường sống, vật liệu và thời tiết.', 'zoo', [
        lesson('Amazing Space', 'Mô tả những sự vật cơ bản trong không gian.', { planet: 'hành tinh', space: 'không gian', astronaut: 'phi hành gia', universe: 'vũ trụ' }, 'An astronaut travels through space to study our universe.'),
        lesson('Our Environment', 'Giải thích hành động bảo vệ môi trường.', { environment: 'môi trường', pollution: 'ô nhiễm', energy: 'năng lượng', protect: 'bảo vệ' }, 'We can protect the environment by using less energy.'),
        lesson('Animals and Habitats', 'Liên kết động vật với môi trường sống.', { habitat: 'môi trường sống', insect: 'côn trùng', extinct: 'tuyệt chủng', survive: 'sống sót' }, 'Animals need a safe habitat to survive.'),
        lesson('Materials and Inventions', 'Mô tả vật liệu và công dụng của phát minh.', { material: 'vật liệu', plastic: 'nhựa', metal: 'kim loại', invention: 'phát minh' }, 'This invention is made of light metal and recycled plastic.'),
        lesson('Extreme Weather', 'Mô tả sự kiện thời tiết và ảnh hưởng.', { hurricane: 'bão lớn', lightning: 'tia chớp', flood: 'lũ lụt', forecast: 'dự báo' }, 'The forecast warned people that a storm was coming.'),
      ]),
      unit('Du lịch và văn hóa', 'Khám phá quốc gia, hành trình, kỳ nghỉ, bảo tàng và văn hóa ẩm thực.', 'beach', [
        lesson('Countries and Languages', 'Nói về quốc gia, quốc tịch và ngôn ngữ.', { country: 'quốc gia', capital: 'thủ đô', language: 'ngôn ngữ', foreign: 'nước ngoài' }, 'People may speak more than one language in this country.'),
        lesson('Planning a Journey', 'Trao đổi thông tin cần thiết cho một hành trình.', { journey: 'hành trình', route: 'tuyến đường', luggage: 'hành lý', departure: 'khởi hành' }, 'We checked the route before our morning departure.'),
        lesson('Holiday Adventures', 'Kể lại trải nghiệm trong một kỳ nghỉ.', { adventure: 'chuyến phiêu lưu', explore: 'khám phá', campsite: 'khu cắm trại', souvenir: 'quà lưu niệm' }, 'While we were exploring, we found a beautiful campsite.'),
        lesson('Museums and History', 'Mô tả hiện vật và sự kiện quá khứ.', { museum: 'bảo tàng', century: 'thế kỷ', king: 'vua', queen: 'nữ hoàng' }, 'The museum displayed objects that belonged to a queen.'),
        lesson('Food and Culture', 'So sánh món ăn và thói quen văn hóa.', { culture: 'văn hóa', traditional: 'truyền thống', recipe: 'công thức', taste: 'hương vị' }, 'This traditional recipe tastes different from food at home.'),
      ]),
      unit('Câu chuyện và bản lĩnh', 'Luyện trình tự câu chuyện, bí ẩn, so sánh tranh, lập luận và tổng ôn Flyers.', 'street', [
        lesson('Story Sequence', 'Dùng từ nối để kể sự kiện theo trình tự.', { although: 'mặc dù', while: 'trong khi', during: 'trong suốt', afterwards: 'sau đó' }, 'Although it was raining, they continued walking and arrived safely afterwards.'),
        lesson('A Small Mystery', 'Suy luận và kể một câu chuyện bí ẩn ngắn.', { mystery: 'điều bí ẩn', clue: 'manh mối', discover: 'phát hiện', secret: 'bí mật' }, 'The children discovered a clue behind the old picture.'),
        lesson('Picture Differences', 'Mô tả chính xác điểm khác nhau giữa hai tranh.', { similar: 'tương tự', different: 'khác nhau', position: 'vị trí', compare: 'so sánh' }, 'In my picture the bag is under the chair, but in yours it is beside it.'),
        lesson('Give a Reason', 'Trả lời câu hỏi và bảo vệ ý kiến bằng lý do.', { cause: 'nguyên nhân', result: 'kết quả', therefore: 'vì vậy', perhaps: 'có lẽ' }, 'Perhaps the match was cancelled because the field was wet.'),
        lesson('Flyers Challenge', 'Tổng hợp hỏi đáp, mô tả, kể chuyện và viết câu.', { continue: 'tiếp tục', imagine: 'tưởng tượng', connect: 'kết nối', complete: 'hoàn thành' }, 'Imagine what happens next and continue the story in three sentences.'),
      ]),
    ],
  },
];

for (const level of levels) {
  const manifest = buildManifest(level);
  const target = resolve(curriculumDir, level.folder);
  mkdirSync(target, { recursive: true });
  writeFileSync(resolve(target, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  writeFileSync(resolve(target, 'CONTENT_SOURCES.md'), sourcesMarkdown(level), 'utf8');
  const lessonCount = manifest.units.reduce((sum, item) => sum + item.lessons.length, 0);
  console.log(`Built ${level.versionCode}: ${manifest.units.length} units, ${lessonCount} lessons.`);
}

function buildManifest(level) {
  const sources = [
    source('CAMBRIDGE_WORDLIST', `${level.title.split(' - ')[0]} wordlist picture book`, level.wordlistUrl, 'Topic pages and alphabetical wordlist'),
    source('CAMBRIDGE_EXAM_FORMAT', `${level.title.split(' - ')[0]} exam format`, level.formatUrl, 'Listening, Reading and Writing, and Speaking task descriptions'),
    source('CAMBRIDGE_LEVEL_OUTCOMES', `${level.title.split(' - ')[0]} qualification overview`, level.overviewUrl, 'CEFR level and learner outcomes'),
    source('LICENSED_MEDIA', 'Existing curriculum illustrations', 'https://pixabay.com/service/license-summary/', 'Locally bundled images with provenance retained from the previous audited package'),
  ];
  let lessonNumber = 0;
  return {
    schemaVersion: 1,
    programCode: 'CAMBRIDGE_YLE_PATH',
    versionCode: level.versionCode,
    levelCode: level.levelCode,
    title: level.title,
    description: level.description,
    status: 'PUBLISHED',
    sources,
    units: level.units.map((item, unitIndex) => {
      const cover = media[item.mediaKey];
      return {
        code: `${level.prefix}_U${pad(unitIndex + 1)}`,
        title: item.title,
        description: item.description,
        order: unitIndex + 1,
        coverImage: cover,
        lessons: item.lessons.map((itemLesson, lessonIndex) => {
          lessonNumber += 1;
          return buildLesson(level, itemLesson, cover, lessonNumber, lessonIndex + 1);
        }),
      };
    }),
  };
}

function buildLesson(level, item, cover, lessonNumber, order) {
  const entries = Object.entries(item.vocabulary);
  const [first, second, third] = entries;
  const tokens = item.model.split(' ');
  const code = `${level.prefix}_L${pad(lessonNumber)}`;
  const refs = ['CAMBRIDGE_WORDLIST', 'CAMBRIDGE_EXAM_FORMAT'];
  const imageContent = { imagePath: cover.path, imageWidth: cover.width, imageHeight: cover.height, imageAlt: cover.alt };
  return {
    code,
    title: item.title,
    objective: item.objective,
    order,
    estimatedMinutes: level.levelCode === 'A2_FLYERS' ? 17 : level.levelCode === 'A1_MOVERS' ? 15 : 13,
    xpReward: level.levelCode === 'A2_FLYERS' ? 30 : level.levelCode === 'A1_MOVERS' ? 25 : 20,
    coverImage: cover,
    activities: [
      activity(code, 1, 'INTRO', 'LEARN', `Khám phá từ mới: ${item.title}`, 'Chạm vào từng từ để nghe phát âm và xem nghĩa tiếng Việt.', 1,
        { ...imageContent, items: entries.map(([word, meaning]) => ({ word, meaning, example: modelForWord(word, item.model) })) }, { mode: 'completion' }, refs),
      activity(code, 2, 'FLASHCARD', 'LEARN', first[0], 'Nghe, đọc to và ghi nhớ từ này.', 1,
        { ...imageContent, term: first[0], meaning: first[1], speechText: first[0] }, { mode: 'completion' }, refs),
      activity(code, 3, 'LISTEN_CHOICE', 'PRACTISE', 'Em nghe thấy từ nào?', 'Bấm loa rồi chọn từ đúng.', 2,
        { speechText: first[0], options: [first, second, third].map(([word]) => ({ id: word, label: word })) }, { value: first[0] }, refs),
      activity(code, 4, 'IMAGE_CHOICE', 'PRACTISE', `Chọn từ phù hợp với chủ đề “${item.title}”.`, 'Quan sát hình và chọn đáp án đúng.', 2,
        { ...imageContent, options: [first, second, third].map(([word]) => ({ id: word, label: word })) }, { value: first[0] }, [...refs, 'LICENSED_MEDIA']),
      activity(code, 5, 'MATCH_PAIRS', 'PRACTISE', 'Ghép từ với nghĩa đúng.', 'Chọn một từ tiếng Anh, rồi chọn nghĩa tiếng Việt tương ứng.', 3,
        { left: [first[0], second[0], third[0]], right: [third[1], first[1], second[1]], leftLabel: 'Tiếng Anh', rightLabel: 'Nghĩa tiếng Việt' },
        { pairs: Object.fromEntries([first, second, third]) }, ['CAMBRIDGE_WORDLIST']),
      activity(code, 6, 'WORD_ORDER', 'CHECK', 'Sắp xếp thành câu đúng.', 'Chạm các từ theo đúng thứ tự.', 3,
        { tokens: rotate(tokens) }, { order: tokens }, ['CAMBRIDGE_LEVEL_OUTCOMES']),
      activity(code, 7, 'TYPE_ANSWER', 'CHECK', `Viết lại câu: ${item.model}`, 'Nhập một câu tiếng Anh hoàn chỉnh.', 3,
        { placeholder: tokens.slice(0, 2).join(' '), maxLength: 120 }, { accepted: acceptedSentences(item.model) }, ['CAMBRIDGE_LEVEL_OUTCOMES']),
      activity(code, 8, 'SPEAK', 'CHECK', item.model, 'Bấm mic và nói theo câu mẫu.', 3,
        { modelText: item.model }, { mode: 'completion' }, ['CAMBRIDGE_EXAM_FORMAT', 'CAMBRIDGE_LEVEL_OUTCOMES']),
    ],
  };
}

function image(filename, width, height, alt) {
  return { path: `/curriculum/starters-2026.2/${filename}`, width, height, alt };
}

function source(ref, title, url, locator) {
  return { ref, title, url, locator, checkedAt };
}

function unit(title, description, mediaKey, lessons) {
  return { title, description, mediaKey, lessons };
}

function lesson(title, objective, vocabulary, model) {
  return { title, objective, vocabulary, model };
}

function activity(lessonCode, order, type, stage, prompt, instruction, xpReward, content, answer, sourceRefs) {
  return { code: `${lessonCode}_A${pad(order)}`, type, stage, order, prompt, instruction, xpReward, content, answer, sourceRefs };
}

function modelForWord(word, model) {
  return model.toLowerCase().includes(word.toLowerCase()) ? model : undefined;
}

function acceptedSentences(model) {
  return model.endsWith('.') || model.endsWith('?')
    ? [model, model.slice(0, -1)]
    : [model];
}

function rotate(values) {
  if (values.length < 2) return values;
  const split = Math.ceil(values.length / 2);
  return [...values.slice(split), ...values.slice(0, split)];
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function sourcesMarkdown(level) {
  return `# Content sources - ${level.versionCode}\n\n` +
    `- Vocabulary scope: ${level.wordlistUrl}\n` +
    `- Activity design: ${level.formatUrl}\n` +
    `- Level outcomes: ${level.overviewUrl}\n` +
    `- Checked: ${checkedAt}\n\n` +
    `The lesson sequence, Vietnamese explanations, prompts, examples and answer keys are original content created for this application. They align with Cambridge Young Learners vocabulary and task families; they are not copied from \"Fun for Starters, Movers and Flyers\".\n`;
}
