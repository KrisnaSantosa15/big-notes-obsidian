## Outline
1. Pengenalan AI Agent & Hermes
2. Cara Kerja Hermes Agent
3. Use Cases Hermes
4. Hands-on: Konfigurasi dan Run Hermes Agent Pertamamu!

### 1. Pengenalan AI Agent & Hermes

Halo teman-teman. Selamat sore, perkenalkan, Aku Krisna. Di kesempatan kali ini, aku mau bahas terkait dengan Hermes Agent. Tapi sebelum itu, aku mau tanya nih, siapa di sini yang suka pakai ChatGPT? Atau mungkin Gemini? atau Kimi malah yang lagi trending? Yukk Absen dulu...

Wahh sepertinya banyak juga yaa, yang suka pakai. Oke kalo gitu, aku ganti deh pertanyaannya. Siapa disini yang pernah pake Openclaw? Atau mungkin Hermes Agent? Ada ga? yuk absen lagi... Mungkin mas Inggih pernah pake atau sering pake malah?

Nah bagi yang belum tau terkait hermes agent, selamat datang di sesi ini. Dan bagi yang sudah tau, selamat dan silakan simak sesi ini sampai habis.

Jadi Pada sesi kali ini, setidaknya ada 4 hal yang akan kita bahas, yaitu

1. pengenalan AI Agent & Hermes, disini kita akan bahas perbedaan antara Chatbot dan AI Agent,
2. cara kerja Hermes Agent,
3. use cases Hermes, Apa aja sih yang biasanya orang-orang lakukan dengan Hermes Agent
4. dan terakhir hands-on konfigurasi dan run Hermes Agent pertamamu.

Mari kita mulai dari pengenalan perbedaan antara Chatbot dan AI Agent.

Tadi di awal aku tanya siapa yang suka pakai ChatGPT, Gemini, atau Kimi. Nah, itu semua adalah contoh dari Chatbot. Kenapa disebut Chatbot? Karena mereka itu dirancang untuk meniru percakapan manusia melalui teks atau suara. Chatbot biasanya memiliki kemampuan terbatas dan hanya dapat merespons pertanyaan atau perintah yang telah diprogram sebelumnya. Ada versi yang rule based atau berdasarkan aturan, ada juga berbasis generative AI seperti ChatGPT, Gemini, dan Kimi. Namun, meskipun generative AI memiliki kemampuan untuk menghasilkan jawaban yang lebih kompleks, mereka tetap memiliki keterbatasan dalam memahami konteks dan melakukan tindakan yang lebih kompleks.

![[ai-agent-vs-chatbot.png]]

Sebagai contoh, kalo kita tanya ke ChatGPT, "Siapa presiden Indonesia saat ini?" maka ChatGPT akan memberikan jawaban yang sesuai dengan data yang ada. Namun, jika kita tanya pertanyaan yang lebih kompleks atau membutuhkan pemahaman konteks yang lebih dalam, ChatGPT mungkin tidak dapat memberikan jawaban yang memadai.

Di sisi lain, AI Agent seperti Hermes Agent memiliki kemampuan yang lebih canggih. AI Agent dapat memahami konteks, belajar dari interaksi sebelumnya, dan bahkan dapat melakukan tindakan tertentu berdasarkan pemahaman tersebut. Dengan kata lain, AI Agent tidak hanya merespons pertanyaan, tetapi juga dapat mengambil inisiatif untuk menyelesaikan tugas atau memberikan rekomendasi yang relevan.

![[kapan-chatbot-bisa-disebut-ai-agent.png]]

Loh tapi kan bang Chatgpt juga bisa seperti itu? Betul sekali! Lalu kapan Chatbot bisa disebagai AI Agent? Nah, Chatbot bisa disebut sebagai AI Agent ketika ia dilengkapi dengan tools tambahan seperti code interpreter, web browser, dan lain-lain. Dengan adanya tools tambahan ini, Chatbot memiliki konteks yang cukup untuk dapat melakukan tugas yang lebih kompleks dan memberikan jawaban yang lebih relevan.

Oke sampai sini paham yaa. Jadi intinya, perbedaan utama antara Chatbot dan AI Agent adalah kemampuan mereka dalam memahami konteks dan melakukan tindakan yang lebih kompleks.

#### Hermes Agent

Nah, sekarang kita masuk ke pembahasan utama kita yaitu Hermes Agent. Apa itu Hermes Agent?

![[hermes-agent.png]]

Berdasarkan dokumentasi resmi dari Nous Research, Hermes Agent adalah sebuah AI Agent yang memiliki kemampuan untuk melakukan self-improving, artinya semakin kita banyak berinteraksi dengan Hermes Agent, maka Hermes Agent akan semakin pintar. Selain itu juga Hermes agent dilengkapi dengan learning loop yang memungkinkan Hermes membuat skill baru secara otomatis, mencari riwayat percakapan dan mengingat konteks percakapan sebelumnya. Dengan kata lain, Hermes Agent dapat belajar dari interaksi sebelumnya dan meningkatkan kemampuannya seiring waktu.

Bayangin aja, kalo kita punya orang yang ngerti banget tentang kita, maunya apa, sukanya apa, seneng ga kira-kira? Nah, itu lah yang dimiliki oleh Hermes Agent. Ia bisa menjadi asisten pribadi kita yang dapat memahami kebutuhan dan preferensi kita dengan lebih baik.
#### Openclaw

![[hermes-vs-openclaw.png]]

Lalu apa bedanya dengan Openclaw? Nah, sebetulnya OpenClaw juga merupakan AI Agent yang sama seperti Hermes. Bedanya, OpenClaw lebih berfokus pada integrasi dan orkestrasi, misalnya menghubungkan AI Agent dengan WhatsApp, Telegram, Discord, atau berbagai layanan lainnya sehingga AI dapat menjalankan workflow secara otomatis. **Sementara itu, Hermes Agent lebih berfokus pada kemampuan belajar.** Hermes sudah memiliki fitur _self-improving_, _learning loop_, dan _persistent memory_ secara native. Artinya, semakin sering kita berinteraksi dengannya, Hermes dapat belajar dari pengalaman, mengingat konteks sebelumnya, bahkan meningkatkan kemampuannya seiring waktu. Sebenarnya  OpenClaw juga bisa dibuat self improving dengan konfigurasi atau penambahan komponen tertentu. Namun, prosesnya tidak sesederhana Hermes Agent karena pada Hermes fitur-fitur tersebut memang sudah menjadi bagian dari desain utamanya.

Aku punya salah satu contoh singkat perbandingan Openclaw dan Hermes Agent, ini aku ambil dari sebuah video Youtube. Misalkan kita instruksikan dua Agent ini untuk membuat sebuah draft untuk video Youtube, lalu di akhir prompt kita bilang "Ini sering aku lakukan beberapa kali". Nah, si Hermes Agent akan akan membuat skill baru secara otomatis tanpa disuruh, lalu  menyimpan konteks tersebut dan mengerjakan draft video Youtube tersebut. Sedangkan Openclaw akan mengerjakan draft video Youtube tersebut tanpa membuat skill apapun.

Di iterasi pertama mungkin tidak ada bedanya karena sama-sama menghasilkan draft video Youtube. Namun, di iterasi kedua, ketika kita memberikan instruksi yang sama, si Hermes Agent akan mengingat konteks sebelumnya dan menggunakn skill baru tadi, sehingga hasilnya akan lebih baik dan efisien karena tahu apa yang harus dikerjakan berdasarkan iterasi sebelumnya. Sedangkan Openclaw akan mengulang proses yang sama tanpa menggunakan konteks sebelumnya, sehingga hasilnya mungkin tidak seefisien Hermes Agent.

![[hermes-testing.png]]

![[openclaw-testing.png|697]]

Coba bayangkan kalo misalkan tugas ini dilakukan berkali-kali, tentu saja Hermes Agent akan lebih efisien dan efektif dalam menyelesaikan tugas tersebut dibandingkan dengan Openclaw. Ini adalah salah satu contoh bagaimana kemampuan self-improving dari Hermes Agent dapat memberikan keuntungan yang signifikan dalam jangka panjang.

![[cost-gap.png]]
### 2. Cara Kerja Hermes Agent

**Black Bridging Slide**: Sebetulnya, bagaimana sih cara kerja Hermes Agent? 

![[closed-learning-loop.png]]

Nah, kita balik lagi ke dokumentasi resmi dari Nous Research, Hermes Agent memiliki sebuah learning loop yang memungkinkan Hermes membuat skill baru secara otomatis, mencari riwayat percakapan dan mengingat konteks percakapan sebelumnya. Dengan kata lain, Hermes Agent dapat belajar dari interaksi sebelumnya dan meningkatkan kemampuannya seiring waktu.

Setidaknya ada 5 tahapan yang dilakukan.
1. **Tugas dari User:** Di tahap ini, hermes akan menerima prompt dari user, misalkan kita minta hermes untuk cari informasi tentang sesuatu. Lalu setelah itu dia lanjut ke tahap kedua
2. **Pahami Konteks:** Setelah hermes menerima prompt yang diberikan oleh user, hermes akan memahami konteks dari prompt tersebut dengan mencari memory dan skill yang relevan dengan kebutuhan.
3. **Eksekusi:** Setelah prompt berhasil dipahami dan siap eksekusi, hermes akan menggunakan tools dan skill yang sudah dipilih tadi sampai tugasnya selesai. Sebetulnya bisa jadi dari eksekusi ini balik lagi ke prompt user untuk meminta klarifikasi, tapi agar sederhana kita ambil contoh pendekatan ini.
4. **Review:** Nah setelah Tugas itu dieksekusi, hermes akan melakukan review terhadap tugas tadi, apa yang berjalan baik dan apa yang gagal. Biasanya dia akan update memory atau bahkan bikin skill sendiri tanpa kita suruh.
5. **Belajar:** Yang terakhir belajar, dan pada tahapan inilah hermes menyimpan skill atau memory tadi, kemudian ketika ada prompt yang masuk dengan konteks yang mirip maka dia akan menggunakan memory dan skill tadi sehingga prosesnya akan lebih efisien.

Nah berikut adalah contoh dari hermes agent yang melakukan update memory dan skill setelah melakukan suatu tugas. 
![[self-improvement-review.png|661]]
![[memory-update.png]]

Tapi berdasarkan dokumentasi resmi dari Hermes, tidak semua tugas itu dibuat sebuah skill atau dimasukan ke memory, tapi ada kriterianya. Yaitu, update memory dilakukan setelah 10 Prompt, dan skills setiap 10 kali invocation/tool use dalam satu turn.
![[hermes-criteria.png]]
### 3. Use Cases Hermes

**Black Briding Slide**: udah install hermes, tapi bingung dipake apa?

Aku udah install hermes nih bang tapi bingung dipake buat apa ya?

Tenang temen-temen, banyak hal yang bisa dilakukan oleh si Hermes ini. Bahkan, di dokumentasi resmi sendiri ada list use case apa saja yang dilakukan komunitas, misalkan jadi personal asisstant, content creation, research dan lain sebagainya.

![[hermes-use-cases.png|697]]

Biar ga bingung mari kita coba hermes agent yang sudah aku konfigurasi. 
Jadi setiap harinya, hermes ini ditugaskan untuk memberikan laporan kepada aku 4 hal.

![[my-use-cases.png]]

1. **Daily Fun Fact:** Setiap jam 8 Pagi, aku minta hermes ini untuk memberikan daily fun fact. Jadi setiap harinya pukul 8 pagi dia akan memberikan fun fact terkait apapun itu, dan aku suruh agar jangan memberikan funfact yang sama setiap harinya karena dia pernah tuh selama 1 minggu memberikan fun fact yang sama terus. 
2. **Daily AI Paper Deep Dive:** Nah Kalo ini kebetulan aku sering FOMO  terkait paper yang lagi trending atau baru diluncurkan. Jadi aku gamau ketinggalan baca artikel jurnal tentang AI, Machine Learning, Deep Learning dan lain sebagainya. Jadi setiap jam 7.30 Pagi aku minta Hermes untuk mencarikan aku satu paper yang menarik, baca sampai selesai, berikan summary nya lalu aku minta hermes ini untuk memberikan opini dia. Jadi aku ga cuman menjadikan hermes ini asisten tapi juga sebagai teman diskusi, Bahkan aku bilang di SOUL.md nya bahwa dia itu bebas mau beropini apapun.
3. **AI Trending Twitter:** Nah untuk use case ini sangat-sangat membantu aku dalam menghilangkan rasa FOMO, di X atau twitter itu kan biasanya informasi informasi baru berdatangan seperti misalkan kemarin kimi K3, atau informasi hangat lainnya. Dengan adanya hermes agent yang bisa search di X aku bisa mendapatkan informasi yang lagi hangat di diperbincangkan di bidang AI tanpa harus scroll-scroll dan malah terdistraksi sama konten lainnya. 
4. **Daily curiosity:** Untuk use case ini aku memberikan kebebasan kepada hermes agent untuk melakukan research secara otonom tentang apapun yang dia ingin ketahui. Jadi instruksi yang aku berikan adalah Pilih satu topik yang menurut kamu ingin ketahui lakukan riset terkait hal tersebut dan buatkan contoh prototipenya menggunakan beberapa sub agents yang kamu miliki. Nah ini adalah use case yang menarik buat aku sekaligu sangat menguras token. Jadi, setiap jam 8 malam dia akan melakukan riset terkait suatu topik, mungkin topik yang bisa membantu aku dalam workflow yang dijalankan atau hal lainnya, setelah itu dia akan membuatkan project kecil sebagai proof of concept bahwa topik yang dipilih itu bisa diimplementasikan di hermes agent.

Dan semua hal yang tadi dilakukan itu akan dikirimkan ke discord dan disimpan di second brain hermes yaitu Obsidian. Ada yang pernah denger terkait second brain? Nah terkait hal ini mungkin nanti akan ada sesi khusus yang membahas terkait obsidian dan second brain ini, jadi pantengin terus devcoach yaa teman-teman.

Di samping 4 hal tersebut, aku juga sedang mencoba untuk mengintegrasikan hermes agent dengan threads, jadi nanti setelah berhasil mencari daily fun fact dia tidak hanya mengirimkan ke discord tapi juga ke threads. Cuman saat ini belum aku eksekusi karena perlu ada persiapan seperti token untuk akses ke threadsnya.

![[social-media-use-case.png]]

Sebetulnya, workflow seperti ini tuh sering digunakan diluaran sana loh temen-temen, jadi misalkan kita jadwalkan hermes ini untuk mencari sesuatu hal yang menarik, berikan summary, bikin draft postingan ke sosial media lalu kirimkan. Aku menemukan banyak sekali orang orang melakukannya bahkan untuk bikin video youtube. Ada agent yang bikin skripnya, ada agent yang bikin suaranya, ada agent yang bikin videonya. Ada juga agent yang tugasnya bikin draft deskripsi lalu mengirimkannya ke youtube.

Mungkin di sini teman-teman punya ide workflow yang lain yang bisa dikerjakan oleh si Hermes ini. Misalnya untuk develop game, website, portfolio atau yang lainnya. Kalo masih bingung mau dipake apa si hermes ini, coba tanya ke diri sendiri. Biasanya aku suka FOMO sama hal apa? 
Atau temen-temen disini adalah seoarang mahasiswa dan lagi skripsian, nah bisa juga minta si hermes ini untuk setiap harisnya ngasih 1 jurnal yang bisa kita baca summarynya. sehingga nanti ketika pas bikin skripsi ngga perlu nyari-nyari lagi.

Nah kalo mas Inggih sendiri, ada ga use case yang biasa digunakan kalo misalkan pake AI agent ini, pake openclaw atau pake hermes agent mungkin?
### 4. Hands-on: Konfigurasi dan Run Hermes Agent Pertamamu!

**Black Briding Slide**: Saatnya bikin Hermes Agent Pertamamu!

![[3-step-config.png]]

Daritadi kita cuman bahas teorinya aja ya. Nah di bagian ini mari kita mulai untuk konfigurasi hermes agent. Setidaknya ada 3 step yang dilakukan:
1. Instalasi
	Di bagian instalasi ini ada banyak pilihannya, mau di Linux, MacOS, Windows bahkan Android pake Termux. Tinggal dipilih aja sesuai kebutuhan. Bahkan ada juga di VPS, kalo yang di VPS ini gampang banget, tinggal satu klik, tunggu beberapa menit, jadi tuh hermes agent nya.

	Selain itu, versi MacOS dan Windows itu punya versi desktopnya, makin gampang untuk konfigurasi kalo ada yang ga pengen pake CLI.

	Cara instalasinya sangat sederhana teman-teman cukup copy paste saja perintah ini ke terminal atau powershell, tunggu, trus langsung jadi:
	
	**Linux / macOS / WSL2 / Android (Termux)**
	` curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash`

	**Windows (native)**
	`iex (irm https://hermes-agent.nousresearch.com/install.ps1) `

	Udah itu aja temen-temen untuk instalasinya, selanjutnya ke bagian yang paling seru yaitu konfigurasi.
	
2. Konfigurasi

	Nah Di bagian ini yang menurut aku seru karena banyak hal yang bisa kita eksplorasi. Cara konfigurasinya juga sangat-sangat mudah, cukup satu perintah juga yaitu:
	
	`hermes setup`
	
	Udah, kita ikutin aja yang perlu dikonfigurasi, kalo gamau semua dikonfigurasi tinggal skip-skip aja.

3. Eksekusi

	Yang terakhir adalah eksekusi, kita tinggal pake aja hermes agent yang sudah kita configure tadi. 


#### Hands-On
#### Next Configuration
Khusus untuk bagian gateway, kita bisa gunakan telegram supaya lebih mudah. Caranya adalah. Kita ke telegram, kemudian cari bot father, setelah itu tinggal ketik `/newbot`. Lalu kita kasih nama dan kasih username. Setelah itu Bot Father akan otomatis memberikan kita token yang bisa dipake. Dan ingat bahwa token ini sensitif ya, karena bisa dipake sama banyak orang kalo misalkan bocor. Aku tidak sensor disini karena token ini tidak valid dan cuman contoh aja.
![[bot-father-search.png]]

![[bot-father.png]]

Di konfigurasi ini kita bisa set model apa yang digunakan, providernya apa, tools yang bisa dipake apa aja dan lain sebagainya. Kita untuk sekarang cukup konfigurasi model dan gateway aja yaa. Untuk lengkapnya nanti akan ada sesi devcoach ekslusif yang akan memandu kalian secara mendalam terkait hal ini, jadi jangan lupa untuk selalu ikuti sesi devocoachnya yaa.

Ahh bang kalo terminal aku sulit solanya jarang pake. Ohh jangan salah, hermes agent ini juga ada versi desktopnya meskipun itu di linux, kita tinggal ketikan perintah ini di terminal:

`hermes desktop`

Maka dia akan otomatis build versi desktopnya. Dan inilah hasilnya. Kita bisa dengan gampang konfigurasi semua hal disini

![[hermes-devcoach-telegram.png]]

Ini link bot devcoach yang sudah kita integrasikan barusan. silakan kalian pakai aja. Tapi inget, ini pake model gratis jadi sangat wajar kalo misalkan nanti hasil jawabannya kurang sesuai atau bahkan gagal. Selain itu, aku juga akan mematikan bot telegram ini beberapa jam kemudian yaa. `https://t.me/hermes_devcoach_bot`

Nah itulah mungkin yang bisa aku share terkait hermes agent. 
## References:
https://www.hostinger.com/id/tutorial/apa-itu-hermes-agent/
https://blog.stackademic.com/forget-chatbots-hermes-agent-is-an-ai-that-actually-learns-from-you-d8d517be7b88
https://www.analyticsvidhya.com/blog/2026/05/hermes-agent-guide/
https://composio.dev/content/openclaw-vs-hermes-agent
https://www.microsoft.com/en-us/microsoft-copilot/for-individuals/do-more-with-ai/general-ai/understanding-ai-agents-vs-chatbots?form=MA13N0

PPT Slides:
https://docs.google.com/presentation/d/1EKmhGy7_W8Kmk3srWwpaFqiAjDbeBiOspbbS2SNZCfw/edit?usp=sharing