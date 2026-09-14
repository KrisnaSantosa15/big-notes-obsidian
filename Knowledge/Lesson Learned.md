
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

3. Gunakan docker-ce/native linux dibandingkan docker desktop karena menggunakan docker desktop sangat lambat,  karena docker desktop itu menjalankan docker engine di dalam VM (linux-kit via QEMU) tidak seperti docker-ce yang menjalankan langsung di native host. Ini berdampak ke proses unit, integration test dan psalm yang ada di codebase. Masalah ini teridentifikasi ketika menggunakan paratest -p8 (spawn 8 paralel test), ketika menggunakan docker desktop, `paratest -p8` memerlukan waktu sekitar 6-7 menit, sedangkan jika menggunakan docker native linux hanya memerlukan waktu 1-2 menti. Note: Testsuite: 2929 test, 20906 assertions.
4. 