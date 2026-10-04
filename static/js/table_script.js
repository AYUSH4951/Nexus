document.addEventListener('DOMContentLoaded', () => {
    const table = document.querySelector('table.dataframe, table.table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    const headerCells = Array.from(table.querySelectorAll('thead tr:last-child th'));

    // Grab original header names (used as labels in mobile card mode)
    const headerNames = headerCells.map(th => th.textContent.trim());

    // Locate the prediction column
    let predColIndex = headerNames.findIndex(t => t.toLowerCase() === 'predicted_column');
    if (predColIndex === -1 && headerCells.length > 0) predColIndex = headerCells.length - 1;
    if (predColIndex !== -1) headerCells[predColIndex].textContent = 'AI PREDICTION';

    const prettify = s => s.replace(/_/g, ' ');

    let totalCount = rows.length;
    let safeCount = 0;
    let threatCount = 0;

    rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td, th'));

        // Labels for card mode
        cells.forEach((cell, i) => {
            if (i !== 0 && i !== predColIndex && headerNames[i]) {
                cell.setAttribute('data-label', prettify(headerNames[i]));
            }
        });

        // Prediction badge
        if (predColIndex >= 0 && predColIndex < cells.length) {
            const predCell = cells[predColIndex];
            const val = parseFloat(predCell.textContent.trim());

            if (val === 1) {
                safeCount++;
                predCell.innerHTML = `
                    <span class="badge badge-safe">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                        Legitimate
                    </span>`;
                row.setAttribute('data-prediction', '1');
            } else {
                threatCount++;
                predCell.innerHTML = `
                    <span class="badge badge-threat">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        Threat (Phishing)
                    </span>`;
                row.setAttribute('data-prediction', '0');
            }
        }

        // Feature values -> chips
        cells.forEach((cell, i) => {
            if (i === 0 || i === predColIndex) return;
            const content = cell.textContent.trim();
            if (content === '1' || content === '1.0') {
                cell.innerHTML = '<span class="chip chip-pos">1</span>';
            } else if (content === '-1' || content === '-1.0') {
                cell.innerHTML = '<span class="chip chip-neg">-1</span>';
            } else if (content === '0' || content === '0.0') {
                cell.innerHTML = '<span class="chip chip-zero">0</span>';
            }
        });

        // Card mode: tap a row to expand / collapse its features
        row.tabIndex = 0;
        const isCardMode = () => window.matchMedia('(max-width: 640px)').matches;
        const toggle = () => { if (isCardMode()) row.classList.toggle('expanded'); };
        row.addEventListener('click', toggle);
        row.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
    });

    // KPIs
    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('safeCount').textContent = safeCount;
    document.getElementById('threatCount').textContent = threatCount;

    const pct = n => totalCount > 0 ? ((n / totalCount) * 100).toFixed(1) : 0;
    document.getElementById('safePercent').textContent = `${pct(safeCount)}% of total batch`;
    document.getElementById('threatPercent').textContent = `${pct(threatCount)}% of total batch`;
    document.getElementById('visibleCounter').textContent = `Showing ${totalCount} of ${totalCount} records`;

    // Filter & search
    let currentFilter = 'all';
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const emptyState = document.getElementById('emptyState');

    function filterRows() {
        const query = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        rows.forEach(row => {
            const pred = row.getAttribute('data-prediction');
            const textMatch = query === '' || row.textContent.toLowerCase().includes(query);
            const filterMatch = currentFilter === 'all' || pred === currentFilter;
            const show = textMatch && filterMatch;
            row.style.display = show ? '' : 'none';
            if (show) visibleCount++;
        });

        document.getElementById('visibleCounter').textContent = `Showing ${visibleCount} of ${totalCount} records`;
        emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            filterRows();
        });
    });

    searchInput.addEventListener('input', filterRows);

    // Export visible rows to CSV (uses clean 1/0 for the prediction column)
    document.getElementById('exportCsvBtn').addEventListener('click', () => {
        const esc = v => `"${String(v).replace(/"/g, '""')}"`;
        const lines = [headerNames.map((h, i) => esc(i === predColIndex ? 'predicted_column' : h)).join(',')];

        rows.forEach(row => {
            if (row.style.display === 'none') return;
            const cells = Array.from(row.querySelectorAll('td, th')).map((c, i) =>
                esc(i === predColIndex ? row.getAttribute('data-prediction') : c.textContent.trim())
            );
            lines.push(cells.join(','));
        });

        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `phishing_predictions_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    });
});
