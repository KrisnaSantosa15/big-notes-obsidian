Main Resources:
- https://huggingface.co/learn
- 
# LLM Development
## Self Attention

Source: https://magazine.sebastianraschka.com/p/understanding-and-coding-self-attention
# Inference Optimization

![[Pasted image 20261016100346.png]]
## KV Cache

KV Cache merupakan sebuah mekanisme untuk menyimpan Key dan Value hasil kalkulasi representasi ketika melakukan inference supaya ketika token generation berikutnya bisa menggunakan token yang sama, sehingga prosesnya tidak berat dan memakan biaya kalkulasi lagi.
Source: https://magazine.sebastianraschka.com/p/coding-the-kv-cache-in-llms

KV Cache ini berlaku untuk satu inference, dan untuk inference berikutnya biasanya reset dulu. misalkan saya prompt "what's machine learning", model akan generate dengan auto regressive dan KV Cache digunakan. Lalu saya tanya lagi "what's deep learning", token yang disimpan di KV cache berbeda dengan di prompt pertama karena KV prompt pertama sudah reset. Ini berlaku untuk new chat/percakapan baru.

Kecuali jika prompt pertama digunakan sebagai konteks seperti ini:
- User: `What is machine learning?`
- Assistant: `Machine learning is ...`
- User: `What is deep learning?`
- Assistant: [Generation with Autoregressive...]
Maka model perlu memahami konteks yang ada
- Tanpa cache reuse: model menghitung KV cache untuk seluruh konteks percakapan lagi.
- Dengan cache reuse: model menggunakan kembali KV cache dari prefix percakapan yang sama, lalu menghitung KV untuk token baru yang ditambahkan.

![[Autoregressive-Illustration.png]]

![[KV.png]]

> This diagram shows how the LLM recomputes key and value vectors for previously seen tokens (”Time” and “flies”) during each generation step. When generating the third token (”fast”), the model recomputes the same k(1)/v(1) and k(2)/v(2) vectors again, rather than reusing them. This repeated computation highlights the inefficiency of not using a KV cache during autoregressive decoding.

KV Cache ini disimpan dalam blok memory, sistem harus menyediakan ruang alokasi memori yang sesuai untuk hasil inference ini (berdasarkan max sequence length: e.g. 2048 tokens). Tetapi ada permasalahan dengan pendekatan standar ini yaitu jika alokasi memori yang digunakan berlebihan maka ada banyak ruang tersisa yang tidak dipakai dan tidak bisa digunakan kembali untuk inference berikutnya untuk menempati ruang kosong di blok itu karena setiap inference yang mengeluarkan token baru harus disimpan di blok terpisah.

Dari permasalahan itu muncul pendekatan baru yang bernama PagedAttention.

## PagedAttention

PagedAttention adalah sebuah mekanisme untuk menyimpan hasil kalkulasi KV (KV Cache) dalam sebuah blok memori yang fixed size dan bisa dialokasikan on demand dan tidak memerlukan untuk disimpan di contiguous memory. 
Source: https://training.continuumlabs.ai/inference/why-is-inference-important/paged-attention-and-vllm

Pendekatan ini menggunakan memory blok yang kecil sehingga internal fragmentation bisa dihindari karena semua blok memiliki size yang sama dan juga bisa sharing memory di blok level.

![[PagedAttention-Illustration.png]]
Source: https://chatgpt.com/share/6ad185fc-1df4-83ec-93f2-b5a130c26971

## Flash Attention



## Multi Token Predictions (MTP)

Daripada autoregressive predict satu token per generation, dia harus bisa melakukan multi token prediction (memprediksi beberapa token sekaligus). Tapi ini sangat rentan karena misalkan model mau predict 5 token sekaligus, token 2 dan 3 ternyata salah, token 4 dan 5 pasti juga akan salah.

https://medium.com/data-science-in-your-pocket/what-are-mtp-models-making-llms-faster-ab4000266804

## Speculative Decoding

Mirip seperti MTP tapi menggunakan model kecil sebagai generator/draft dan model besar sebagai verifier. 

https://developer.nvidia.com/blog/an-introduction-to-speculative-decoding-for-reducing-latency-in-ai-inference/

https://research.google/blog/looking-back-at-speculative-decoding/