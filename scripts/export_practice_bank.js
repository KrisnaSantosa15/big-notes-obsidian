/**
 * Script untuk mengekstrak seluruh 393 soal latihan AWS Certified AI Practitioner (AIF-C01)
 * dari https://pintardengan.ai/pelatihanAI/ langsung ke file Markdown tanpa perlu browser agent/CDP.
 * 
 * Penggunaan:
 *   node scripts/export_practice_bank.js
 */

const fs = require('fs');
const path = require('path');

const DOMAIN_NAMES = {
    1: 'Fundamentals of AI and ML',
    2: 'Fundamentals of Generative AI',
    3: 'Applications of Foundation Models',
    4: 'Guidelines for Responsible AI',
    5: 'Security, Compliance, and Governance for AI Solutions'
};

async function main() {
    console.log('Mengunduh halaman dari https://pintardengan.ai/pelatihanAI/...');
    const res = await fetch('https://pintardengan.ai/pelatihanAI/');
    if (!res.ok) {
        throw new Error(`Gagal mengunduh halaman: ${res.status} ${res.statusText}`);
    }
    const html = await res.text();

    console.log('Mengekstrak data JSON question bank dari script client-side...');
    const match = html.match(/atob\("([^"]+)"\)/);
    if (!match) {
        throw new Error('Tidak menemukan payload base64 QUESTIONS pada halaman!');
    }

    const base64Str = match[1];
    const jsonStr = Buffer.from(base64Str, 'base64').toString('utf8');
    const questions = JSON.parse(jsonStr);

    console.log(`Ditemukan total ${questions.length} soal.`);

    const mdLines = [
        '# AWS Certified AI Practitioner (AIF-C01) — Practice Question Bank (393 Questions)',
        '',
        '> Sumber: [pintardengan.ai/pelatihanAI](https://pintardengan.ai/pelatihanAI/) — Mode Latihan Lengkap (393 Soal, Kunci Jawaban & Pembahasan)',
        '',
        '### Question review',
        ''
    ];

    questions.forEach((q, idx) => {
        const num = idx + 1;
        const domainName = DOMAIN_NAMES[q.domain] || `Domain ${q.domain}`;
        const typeLabel = q.type === 'single' ? 'Multiple choice' :
                          q.type === 'multi' ? 'Multiple response' : 'Matching';

        mdLines.push(`✔ Domain ${q.domain}: ${domainName} · ${typeLabel}`);
        mdLines.push('');
        mdLines.push(`${num}. ${q.question}`);
        mdLines.push('');

        // Opsi pilihan ganda
        if (q.type === 'single' || q.type === 'multi') {
            if (Array.isArray(q.options) && q.options.length > 0) {
                q.options.forEach(opt => {
                    mdLines.push(`${opt.key}. ${opt.text}`);
                });
                mdLines.push('');
            }
        } else if (q.type === 'match') {
            if (Array.isArray(q.pairs) && q.pairs.length > 0) {
                mdLines.push('**Prompts:**');
                q.pairs.forEach(p => {
                    mdLines.push(`- ${p.prompt}`);
                });
                mdLines.push('');
            }
            if (Array.isArray(q.termBank) && q.termBank.length > 0) {
                mdLines.push('**Term Bank:**');
                q.termBank.forEach(t => {
                    mdLines.push(`- ${t}`);
                });
                mdLines.push('');
            }
        }

        // Kunci jawaban
        let correctSummary = '';
        if (q.type === 'single' || q.type === 'multi') {
            correctSummary = q.correct.map(k => {
                const opt = (q.options || []).find(o => o.key === k);
                return opt ? `${k}. ${opt.text}` : k;
            }).join(' | ');
        } else if (q.type === 'match') {
            correctSummary = (q.pairs || []).map(p => `${p.prompt} → ${p.answer}`).join(' | ');
        }

        mdLines.push(`**Correct answer:** ${correctSummary}`);
        mdLines.push('');
        mdLines.push(q.explanation || '');
        mdLines.push('');
        mdLines.push('---');
        mdLines.push('');
    });

    const outputPath = path.resolve(__dirname, '..', 'Knowledge', 'AWS AI Certification Practice Question Bank 393.md');
    fs.writeFileSync(outputPath, mdLines.join('\n'), 'utf8');

    console.log(`Berhasil mengekspor 393 soal ke: ${outputPath}`);
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
