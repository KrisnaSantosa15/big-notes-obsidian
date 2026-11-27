27 Nov 2026

- Ketika sedang membuat aggregate, hindari primitive obsession: kondisi di mana suatu aggregate itu memiliki banyak tipe data primitif -> string, int, bool, etc. misalnya:
```php
class UpdateParticipant extends Aggregates
{
    public function __construct(
        public string $email,
        public string $phoneNumber,
        public int $age,
        public string $status,
    ) {}
}
```
- Secara teknis ini valid, tapi semua informasi participant ini direpresentasikan sebagai primitive. Masalahnya, gimana kalau emailnya invalid? phone number kurang dari 11, age negatif dan lainnya. Misal:
```php
$participant = new UpdateParticipant(
	email: 'sembarangan-aja'
	phoneNumber: 'inistring123'
	age: -22
	status: 'Actv'
)
```
- Ketika bikin object bisa berhasil meskipun datanya tidak valid secara domain.
- Maka dari itu kita harus melakukan validasi, misalkan di domain, ini bisa saja tapi aggregate bisnis update participant ini jadi banyak yang dilakukan, padahal semuanya bisa punya makna domain sendiri
```php
class UpdateParticipant extends Aggregates
{
    private string $email;
    private string $status;
    ...

    public function __construct(
        string $email,
        string $status,
        ...
    ) {
        $this->validateEmail($email);
        $this->validateStatus($status);
        ...

        $this->email = $email;
        $this->status = $status;
        ...
    }

    private function validateEmail(string $email): void
    {
        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('Invalid email.');
        }
    }

    private function validateStatus(string $status): void
    {
        $allowedStatuses = ['active', 'inactive'];

        if (! in_array($status, $allowedStatuses, true)) {
            throw new InvalidArgumentException('Invalid status.');
        }
    }
}
```
- maka dari itu dibuatlah Value Object untuk menghindari primitive obsession dan juga validation rules yang tercecer.
- misalkan untuk email jadi gini:
```php
class Email extends ValueObjects {

protected static array $rules = [
'email' => 'required|email'
]

public function __construct (array $data){
...
}
}
```
- Nanti bisa digunakan di aggregate dengan VO seperti ini:
```php

class UpdateParticipant extends Aggregates {

use ... email

public function __construct(
Email $email
PhoneNumber $phoneNumber
...
){
...
}

}

```
- Sehingga setiap object primitif itu memiliki makna secara domain dan divalidasi berdasarkan tanggung jawab masing-masing, jika email tidak valid berati urusannya adalah VO Email dan seterusnya.
- 