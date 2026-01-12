(function() {
    'use strict';

    const VARIABLES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const PERIODS = ['past', 'present', 'ideal'];
    const VARIABLE_NAMES = {
        'A': 'Sexual Attraction',
        'B': 'Sexual Behaviour',
        'C': 'Sexual Fantasies',
        'D': 'Emotional Preference',
        'E': 'Social Preference',
        'F': 'Lifestyle Preference',
        'G': 'Self-Identification'
    };

    const BI_BLUE = '#0038A8';
    const BI_LAVENDER = '#9B4F96';
    const BI_PINK = '#D60270';

    function getScoreLabel(score) {
        const rounded = Math.round(score * 10) / 10;
        if (rounded <= 1.3) return 'Heterosexual';
        if (rounded <= 2.0) return 'Mostly Heterosexual';
        if (rounded <= 2.7) return 'Hetero-leaning Bisexual';
        if (rounded <= 3.3) return 'Bi: Heterosexual Leaning';
        if (rounded <= 4.0) return 'Bisexual';
        if (rounded <= 4.7) return 'Bi: Homosexual Leaning';
        if (rounded <= 5.3) return 'Homo-leaning Bisexual';
        if (rounded <= 6.0) return 'Mostly Homosexual';
        return 'Homosexual';
    }

    function getColorForValue(value) {
        const t = (value - 1) / 6;
        if (t <= 0.5) {
            return interpolateColor(BI_BLUE, BI_LAVENDER, t * 2);
        } else {
            return interpolateColor(BI_LAVENDER, BI_PINK, (t - 0.5) * 2);
        }
    }

    function interpolateColor(color1, color2, t) {
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);
        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);

        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);

        return `rgb(${r}, ${g}, ${b})`;
    }

    function getContrastColor(bgColor) {
        const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!match) return 'white';
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#1a1a2e' : 'white';
    }

    function collectAnswers() {
        const answers = {};
        for (const v of VARIABLES) {
            for (const p of PERIODS) {
                const name = `${v}-${p}`;
                const selected = document.querySelector(`input[name="${name}"]:checked`);
                if (selected) {
                    answers[name] = parseInt(selected.value);
                }
            }
        }
        return answers;
    }

    function answersToHash(answers) {
        let hash = '';
        for (const v of VARIABLES) {
            for (const p of PERIODS) {
                const name = `${v}-${p}`;
                hash += answers[name] || '0';
            }
        }
        return hash;
    }

    function hashToAnswers(hash) {
        if (!hash || hash.length !== 21) return null;
        const answers = {};
        let i = 0;
        for (const v of VARIABLES) {
            for (const p of PERIODS) {
                const val = parseInt(hash[i]);
                if (val >= 1 && val <= 7) {
                    answers[`${v}-${p}`] = val;
                } else {
                    return null;
                }
                i++;
            }
        }
        return answers;
    }

    function calculateAverages(answers) {
        const averages = { past: 0, present: 0, ideal: 0 };
        for (const p of PERIODS) {
            let sum = 0;
            for (const v of VARIABLES) {
                sum += answers[`${v}-${p}`];
            }
            averages[p] = sum / VARIABLES.length;
        }
        averages.overall = (averages.past + averages.present + averages.ideal) / 3;
        return averages;
    }

    function displayResults(answers) {
        const tbody = document.getElementById('results-body');
        tbody.innerHTML = '';

        for (const v of VARIABLES) {
            const row = document.createElement('tr');
            const th = document.createElement('th');
            th.scope = 'row';
            th.textContent = `${v}. ${VARIABLE_NAMES[v]}`;
            row.appendChild(th);

            for (const p of PERIODS) {
                const td = document.createElement('td');
                const value = answers[`${v}-${p}`];
                td.textContent = value;
                const bgColor = getColorForValue(value);
                td.style.backgroundColor = bgColor;
                td.style.color = getContrastColor(bgColor);
                row.appendChild(td);
            }

            tbody.appendChild(row);
        }

        const averages = calculateAverages(answers);

        for (const p of PERIODS) {
            const cell = document.getElementById(`avg-${p}`);
            const avg = averages[p];
            cell.textContent = `${avg.toFixed(1)} - ${getScoreLabel(avg)}`;
            const bgColor = getColorForValue(avg);
            cell.style.backgroundColor = bgColor;
            cell.style.color = getContrastColor(bgColor);
        }

        const overallCell = document.getElementById('overall-score');
        const overall = averages.overall;
        overallCell.textContent = `${overall.toFixed(2)} - ${getScoreLabel(overall)}`;
        const bgColor = getColorForValue(overall);
        overallCell.style.backgroundColor = bgColor;
        overallCell.style.color = getContrastColor(bgColor);

        document.getElementById('quiz-section').classList.add('hidden');
        document.getElementById('results-section').classList.remove('hidden');

        window.location.hash = answersToHash(answers);
    }

    function loadFromHash() {
        const hash = window.location.hash.slice(1);
        const answers = hashToAnswers(hash);
        if (answers) {
            displayResults(answers);
            return true;
        }
        return false;
    }

    function init() {
        const form = document.getElementById('quiz-form');
        const copyBtn = document.getElementById('copy-link-btn');
        const retakeBtn = document.getElementById('retake-btn');

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const answers = collectAnswers();
            if (Object.keys(answers).length === 21) {
                displayResults(answers);
            }
        });

        copyBtn.addEventListener('click', function() {
            navigator.clipboard.writeText(window.location.href).then(function() {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(function() {
                    copyBtn.textContent = originalText;
                }, 2000);
            }).catch(function() {
                prompt('Copy this link:', window.location.href);
            });
        });

        retakeBtn.addEventListener('click', function() {
            window.location.hash = '';
            document.getElementById('results-section').classList.add('hidden');
            document.getElementById('quiz-section').classList.remove('hidden');
            form.reset();
            window.scrollTo(0, 0);
        });

        if (!loadFromHash()) {
            document.getElementById('quiz-section').classList.remove('hidden');
        }

        window.addEventListener('hashchange', function() {
            if (window.location.hash) {
                loadFromHash();
            } else {
                document.getElementById('results-section').classList.add('hidden');
                document.getElementById('quiz-section').classList.remove('hidden');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
