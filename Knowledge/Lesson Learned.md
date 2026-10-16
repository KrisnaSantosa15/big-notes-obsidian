
For future engineers.
1. Jika ingin belajar DDD, coba untuk akses visualisasi hasil vibe coded ini:
[LINK]



2. Saat bikin branch baru pastikan untuk melakukan ini dulu:
git pull master
deck composer install
deck art migrate
deck art migrate --env=testing
deck fe-install
deck npm install 
deck composer full-acceptance (opsional, untuk memastikan error yang terjadi di testing itu sudah dari sananya atau karena perubahan kita di branch yang akan dibuat)

3. Gunakan docker-ce/native linux dibandingkan docker desktop karena menggunakan docker desktop sangat lambat,  karena docker desktop itu menjalankan docker engine di dalam VM (linux-kit via QEMU) tidak seperti docker-ce yang menjalankan langsung di native host. Ini berdampak ke proses unit, integration test dan psalm yang ada di codebase. Masalah ini teridentifikasi ketika menggunakan paratest -p8 (spawn 8 paralel test), ketika menggunakan docker desktop, `paratest -p8` memerlukan waktu sekitar 6-7 menit, sedangkan jika menggunakan docker native linux hanya memerlukan waktu 1-2 menit. Note: Testsuite: 2929 test, 20906 assertions.

4. Setelah migrasi dari Docker Desktop ke native Docker Engine (docker-ce), ada efek samping yang perlu diwaspadai: image `web` (php-fpm) di `deck` selalu dikonfigurasi jalan sebagai user `www-data` (bukan bug baru, sudah begitu dari sananya) — tapi Docker Desktop diam-diam nge-translate semua file yang ditulis lewat bind mount supaya keliatan milik host user, apa pun UID asli di dalam container. Docker native (bind mount raw passthrough) tidak melakukan translasi ini, jadi mismatch UID antara `www-data` (proses web, php-fpm) vs `deck` (UID 1000, dipakai proses CLI: composer/artisan/test) yang tadinya tersembunyi di Docker Desktop, sekarang kena telak. Gejalanya: `chmod(): Operation not permitted` waktu nulis log (contoh: domain event log di `DOMAIN_EVENTS/{eventType}/`, atau log harian `dicoding-YYYY-MM-DD.log`) — file yang dibuat proses satu (misal `www-data`) gagal di-chmod/ditulis ulang oleh proses lain (`deck`).
   Fix-nya PURE environment-level, tidak perlu ubah `deck/` submodule atau kode app: bikin `docker-compose.override.yml` lokal (sudah di-gitignore, otomatis di-merge Compose tanpa app perlu tahu) yang override command service `web` buat patch `/usr/local/etc/php-fpm.d/www.conf` (`user`/`group` dari `www-data` jadi `deck`) sebelum `supervisord` start:
   ```yaml
   services:
     web:
       command: >
         sh -c "sed -i 's/^user = www-data/user = deck/; s/^group = www-data/group = deck/' /usr/local/etc/php-fpm.d/www.conf &&
         /tmp/wait && supervisord --nodaemon -c /etc/supervisord.conf"
   ```
   Setelah itu recreate container web (`docker compose up -d --force-recreate web`, tidak perlu rebuild image), dan chown balik file-file yang kadung kepunya `www-data` (`docker exec -u root dicoding-web-1 sh -c "find /var/www/DICODING_ENV /var/www/DICODING_LOGS -user www-data -exec chown deck:www-data {} \;"`).
   Bonus temuan: exception permission ini bisa nge-trigger bug lain — `DomainEventLogWriter::writeLog()` (`Dicoding/Infrastructure/Logging/Writer/DomainEventLogWriter.php`) push handler baru ke Logger sebelum nulis, dan pop lagi sesudahnya, TANPA try/finally. Kalau proses nulis log-nya throw (misal karena masalah permission di atas), `popHandler()` ke-skip dan handler stack Logger korup buat sisa proses/request itu — di test, ini nongol sebagai `Call to undefined method Monolog\Handler\RotatingFileHandler::getRecords()` di assertion test yang harusnya baca `TestHandler` mock. Bug ini pre-existing (bukan disebabkan migrasi), belum diperbaiki, dan sebaiknya jadi issue terpisah kalau mau dibenerin di kode.
   Catatan tambahan: setelah rebuild image lewat `deck build web`/`deck install`, jalankan `deck composer dump-autoload -o` kalau ada test gagal dengan error "Target class [...] does not exist" — tanda classmap Composer basi.
