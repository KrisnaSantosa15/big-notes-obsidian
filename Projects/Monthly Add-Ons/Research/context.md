# Add-Ons — Context

Domain language for the Add-Ons exploration: purchasable entitlements (Sabak, Learning with AI) that a user can buy independently of a subscription. This is a research/exploration doc — nothing here is final until the feature is implemented; treat it as a running decision log for the grilling session, not a spec.

Current Subscription plans in this codebase:
Base Pricing untuk Infra / AI	
Chatbot	$1.6 (Rp. 29.000)
Sabak	$12 (Rp. 200.000)

Free Trial					
Chatbot	20 credits selamanya (non-renewable, unless pay with add-on)				
Sabak	opsi 1: 15 menit free trial; opsi 2: $10 per hari untuk akumulatif trial user; opsi 3, bayar pertama trial 1 hari/4 jam - 20rb; opsi 4, beta testing 1 bulan untuk siswa  yang pernah langganan plus (aktivasinya pakai flagging).				

Paket Langganan Single Course		
Paket		
	Dasar	500,000
	Pemula	600,000
	Menengah	950,000
	Mahir - Profesional	1,150,000
		
Benefit		
	Akses spesifik kelas selama 30 hari	
	Forum Diskusi	
	Unlimited Submission	
	Code Review	
	Sertifikat kompetensi	
	Pembaruan sertifikat	
	Kuota 50 per hari Explain with AI	

Paket Langganan learning Path		
Paket		
	Pemula	650,000
	Lanjutan (non-pemula)	1,300,000
Benefit		
	Akses kelas Pemula/Lanjutan di Learning Path terpilih selama 30 hari	
		
Paket		
	Komplit	3,150,000
Benefit		
	Akses Seluruh Kelas di Learning Path spesifik selama 90 hari	
		
Benefit Umum		
	Forum Diskusi	
	Unlimited Submission	
	Code Review	
	Sertifikat kompetensi	
	Pembaruan sertifikat	
	Kuota 50 per hari Explain with AI	

Paket Langganan Plus		
Paket		
	1 Bulan	1,500,000
	3 Bulan	4,500,000
	6 Bulan	9,000,000
	1 Tahun	18,000,000
		
Benefit		
	Akses seluruh kelas selama subscription aktif	
	Forum Diskusi	
	Unlimited Submission	
	Code Review	
	Sertifikat kompetensi	
	Pembaruan sertifikat	
	Kuota 50 per hari Explain with AI	


Basis Add-on Fitur Premium Perbulan	
Kuota 30 credit Learning with AI	50,000
Akses fitur Sabak	250,000

## Language

**Learning with AI**:
Customer-facing / commercial name for the **Student Chatbot** product — used in pricing pages, the add-on SKU, and marketing copy. Refers to the same underlying feature and credit pool as Student Chatbot (see `docs/domains/student-chatbot/context.md`); not a different product.
_Avoid_: Using "Learning with AI" in code, config keys (`student-chatbot` stays as-is), or internal/engineering docs — use **Student Chatbot** there.
