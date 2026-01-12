(function() {
    'use strict';

    const VARIABLES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const PERIODS = ['past', 'present', 'future'];
    const VARIABLE_NAMES = {
        'A': 'Sexual Attraction',
        'B': 'Sexual Behaviour',
        'C': 'Sexual Fantasies',
        'D': 'Emotional Preference',
        'E': 'Social Preference',
        'F': 'Lifestyle Preference',
        'G': 'Self-Identification'
    };

    const SCALE_AE = [
        { value: 1, label: 'Other sex only' },
        { value: 2, label: 'Other sex mostly' },
        { value: 3, label: 'Other sex somewhat more' },
        { value: 4, label: 'Both sexes equally' },
        { value: 5, label: 'Same sex somewhat more' },
        { value: 6, label: 'Same sex mostly' },
        { value: 7, label: 'Same sex only' }
    ];

    const SCALE_FG = [
        { value: 1, label: 'Heterosexual only' },
        { value: 2, label: 'Heterosexual mostly' },
        { value: 3, label: 'Heterosexual somewhat more' },
        { value: 4, label: 'Heterosexual and homosexual equally' },
        { value: 5, label: 'Homosexual somewhat more' },
        { value: 6, label: 'Homosexual mostly' },
        { value: 7, label: 'Homosexual only' }
    ];

    function getColorForValue(value) {
        const t = (value - 1) / 6;
        if (t <= 0.5) {
            const pct = Math.round(t * 2 * 100);
            return `color-mix(in oklch, var(--bi-lavender) ${pct}%, var(--bi-blue))`;
        } else {
            const pct = Math.round((t - 0.5) * 2 * 100);
            return `color-mix(in oklch, var(--bi-pink) ${pct}%, var(--bi-lavender))`;
        }
    }

    function getScoreLabel(score) {
        const rounded = Math.round(score)
        if (rounded == 1) return 'Heterosexual';
        if (rounded == 2) return 'Bi: Mostly Heterosexual';
        if (rounded == 3) return 'Bi: Heterosexual Leaning';
        if (rounded == 4) return 'Bisexual';
        if (rounded == 5) return 'Bi: Homosexual Leaning';
        if (rounded == 6) return 'Bi: Mostly Homosexual';
        return 'Homosexual'; // 7
    }

    function populateDropdowns() {
        const questionBlocks = document.querySelectorAll('.question-block');
        questionBlocks.forEach(function(block) {
            const scale = block.dataset.scale === 'fg' ? SCALE_FG : SCALE_AE;
            const selects = block.querySelectorAll('select');
            selects.forEach(function(select) {
                const placeholder = document.createElement('option');
                placeholder.value = '';
                placeholder.textContent = 'Select...';
                placeholder.disabled = true;
                placeholder.selected = true;
                select.appendChild(placeholder);

                scale.forEach(function(item) {
                    const option = document.createElement('option');
                    option.value = item.value;
                    option.textContent = item.label;
                    select.appendChild(option);
                });
            });
        });
    }

    function collectAnswers() {
        const answers = {};
        for (const v of VARIABLES) {
            for (const p of PERIODS) {
                const name = `${v}-${p}`;
                const select = document.querySelector(`select[name="${name}"]`);
                if (select && select.value) {
                    answers[name] = parseInt(select.value);
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
        const averages = { past: 0, present: 0, future: 0 };
        for (const p of PERIODS) {
            let sum = 0;
            for (const v of VARIABLES) {
                sum += answers[`${v}-${p}`];
            }
            averages[p] = sum / VARIABLES.length;
        }
        averages.overall = (averages.past + averages.present + averages.future) / 3;
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
                td.style.backgroundColor = getColorForValue(value);
                row.appendChild(td);
            }

            tbody.appendChild(row);
        }

        const averages = calculateAverages(answers);

        for (const p of PERIODS) {
            const cell = document.getElementById(`avg-${p}`);
            const avg = averages[p];
            cell.textContent = getScoreLabel(avg);
            cell.style.backgroundColor = getColorForValue(avg);
        }

        const overallCell = document.getElementById('overall-score');
        const overall = averages.overall;
        overallCell.textContent = getScoreLabel(overall);
        overallCell.style.backgroundColor = getColorForValue(overall);

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
        populateDropdowns();

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
