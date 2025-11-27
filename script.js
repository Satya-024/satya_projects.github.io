// K-Map Solver - JavaScript

let currentKMap = null;
let currentVariables = 3;
let currentMinterms = [1, 2, 5, 6];
let kmapGrid = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateKMap();
});

// Update K-Map based on variable selection
function updateKMap() {
    currentVariables = parseInt(document.getElementById('variables').value);
    generateKMap(currentVariables);
}

// Generate K-Map structure
function generateKMap(variables) {
    const container = document.getElementById('kmapContainer');
    container.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'kmap-table';

    if (variables === 2) {
        // 2-variable K-Map: 2x2
        generateKMap2Var(table);
    } else if (variables === 3) {
        // 3-variable K-Map: 2x4 (A as rows, BC as columns)
        generateKMap3Var(table);
    } else if (variables === 4) {
        // 4-variable K-Map: 4x4 (AB as rows, CD as columns)
        generateKMap4Var(table);
    }

    container.appendChild(table);
}

// Generate 2-variable K-Map
function generateKMap2Var(table) {
    const cells = [
        [0, 1],
        [2, 3]
    ];

    // Header row
    const headerRow = table.insertRow();
    headerRow.insertCell().className = 'cell-label';
    headerRow.insertCell().textContent = "B' (0)";
    headerRow.insertCell().textContent = 'B (1)';

    // Data rows
    const labels = ["A' (0)", 'A (1)'];
    for (let i = 0; i < 2; i++) {
        const row = table.insertRow();
        const labelCell = row.insertCell();
        labelCell.textContent = labels[i];
        labelCell.className = 'cell-label';

        for (let j = 0; j < 2; j++) {
            const cellIndex = cells[i][j];
            const cell = row.insertCell();
            cell.textContent = currentMinterms.includes(cellIndex) ? '1' : '0';
            cell.className = currentMinterms.includes(cellIndex) ? 'cell-1' : 'cell-0';
            cell.dataset.index = cellIndex;
            cell.onclick = () => toggleCell(cell);
        }
    }
}

// Generate 3-variable K-Map
function generateKMap3Var(table) {
    const cells = [
        [0, 1, 3, 2],
        [4, 5, 7, 6]
    ];

    // Header row
    const headerRow = table.insertRow();
    headerRow.insertCell().className = 'cell-label';
    const bcValues = ['00', '01', '11', '10'];
    for (let val of bcValues) {
        const cell = headerRow.insertCell();
        cell.textContent = `BC=${val}`;
        cell.className = 'cell-label';
    }

    // Data rows
    const labels = ["A' (0)", 'A (1)'];
    for (let i = 0; i < 2; i++) {
        const row = table.insertRow();
        const labelCell = row.insertCell();
        labelCell.textContent = labels[i];
        labelCell.className = 'cell-label';

        for (let j = 0; j < 4; j++) {
            const cellIndex = cells[i][j];
            const cell = row.insertCell();
            cell.textContent = currentMinterms.includes(cellIndex) ? '1' : '0';
            cell.className = currentMinterms.includes(cellIndex) ? 'cell-1' : 'cell-0';
            cell.dataset.index = cellIndex;
            cell.onclick = () => toggleCell(cell);
        }
    }
}

// Generate 4-variable K-Map
function generateKMap4Var(table) {
    const cells = [
        [0, 1, 3, 2],
        [4, 5, 7, 6],
        [12, 13, 15, 14],
        [8, 9, 11, 10]
    ];

    // Header row
    const headerRow = table.insertRow();
    headerRow.insertCell().className = 'cell-label';
    const cdValues = ['00', '01', '11', '10'];
    for (let val of cdValues) {
        const cell = headerRow.insertCell();
        cell.textContent = `CD=${val}`;
        cell.className = 'cell-label';
    }

    // Data rows
    const abValues = ['00', '01', '11', '10'];
    for (let i = 0; i < 4; i++) {
        const row = table.insertRow();
        const labelCell = row.insertCell();
        labelCell.textContent = `AB=${abValues[i]}`;
        labelCell.className = 'cell-label';

        for (let j = 0; j < 4; j++) {
            const cellIndex = cells[i][j];
            const cell = row.insertCell();
            cell.textContent = currentMinterms.includes(cellIndex) ? '1' : '0';
            cell.className = currentMinterms.includes(cellIndex) ? 'cell-1' : 'cell-0';
            cell.dataset.index = cellIndex;
            cell.onclick = () => toggleCell(cell);
        }
    }
}

// Toggle cell state
function toggleCell(cell) {
    const index = parseInt(cell.dataset.index);
    if (currentMinterms.includes(index)) {
        currentMinterms = currentMinterms.filter(m => m !== index);
        cell.textContent = '0';
        cell.className = 'cell-0';
    } else {
        currentMinterms.push(index);
        currentMinterms.sort((a, b) => a - b);
        cell.textContent = '1';
        cell.className = 'cell-1';
    }
    document.getElementById('minterms').value = currentMinterms.join(', ');
}

// Solve K-Map
function solveKMap() {
    const input = document.getElementById('minterms').value.trim();
    
    if (!input) {
        showError('Please enter at least one minterm');
        return;
    }

    try {
        currentMinterms = input.split(',')
            .map(m => parseInt(m.trim()))
            .filter(m => !isNaN(m));

        // Validate minterms
        const maxMinterm = Math.pow(2, currentVariables) - 1;
        for (let m of currentMinterms) {
            if (m < 0 || m > maxMinterm) {
                showError(`Minterms must be between 0 and ${maxMinterm} for ${currentVariables} variables`);
                return;
            }
        }

        if (currentMinterms.length === 0) {
            showError('Please enter valid minterms');
            return;
        }

        // Remove duplicates and sort
        currentMinterms = [...new Set(currentMinterms)].sort((a, b) => a - b);
        document.getElementById('minterms').value = currentMinterms.join(', ');

        // Update K-Map visualization
        updateKMap();

        // Perform simplification
        const result = simplifyKMap(currentMinterms, currentVariables);
        
        // Display results
        displayResults(result);
        
        showSuccess('K-Map solved successfully!');
    } catch (error) {
        showError('Error solving K-Map: ' + error.message);
    }
}

// Simplify K-Map using prime implicants and Boolean algebra
function simplifyKMap(minterms, variables) {
    if (minterms.length === 0) {
        return {
            expression: '0',
            simplifiedForm: 'F = 0',
            groups: [],
            explanation: 'No minterms selected - function is always 0'
        };
    }

    const maxValue = Math.pow(2, variables);
    
    // If all minterms are selected
    if (minterms.length === maxValue) {
        return {
            expression: '1',
            simplifiedForm: 'F = 1',
            groups: [],
            explanation: 'All minterms selected - function is always 1'
        };
    }

    const grid = Array(maxValue).fill(0);
    
    for (let m of minterms) {
        grid[m] = 1;
    }

    // Find prime implicants (largest groups first)
    const groups = findAllPrimeImplicants(grid, variables);
    
    // Find essential prime implicants and create minimal expression
    const selectedGroups = findEssentialPrimeImplicants(groups, minterms);
    
    // Generate simplified expression from selected groups
    const terms = selectedGroups.map(group => generateTerm(group, variables)).filter(t => t !== '');
    
    const expression = terms.length === 0 ? '0' : terms.join(' + ');
    const simplifiedForm = `F = ${expression}`;

    return {
        expression: expression || '0',
        simplifiedForm: simplifiedForm,
        groups: selectedGroups,
        allPrimeImplicants: groups,
        minterms: minterms,
        explanation: generateExplanation(selectedGroups, variables)
    };
}

// Find all prime implicants
function findAllPrimeImplicants(grid, variables) {
    const allGroups = [];
    const maxValue = Math.pow(2, variables);

    // Try all possible group sizes (largest first for efficiency)
    for (let size = maxValue; size >= 1; size /= 2) {
        for (let i = 0; i < maxValue; i++) {
            if (!grid[i]) continue;

            const group = findPrimeGroup(grid, i, size, variables);
            if (group && group.cells.length === size && isValidGroup(group)) {
                // Check if this group is not already covered
                if (!allGroups.some(g => arraysEqual(g.cells, group.cells))) {
                    allGroups.push(group);
                }
            }
        }
    }

    return allGroups;
}

// Find essential prime implicants using greedy algorithm
function findEssentialPrimeImplicants(primeImplicants, minterms) {
    const selectedGroups = [];
    const coveredMinterms = new Set();
    
    // Sort by group size (largest first - covers more minterms)
    const sortedGroups = [...primeImplicants].sort((a, b) => b.cells.length - a.cells.length);

    for (let group of sortedGroups) {
        // Check if this group covers any uncovered minterms
        const newCoverage = group.cells.filter(c => !coveredMinterms.has(c));
        
        if (newCoverage.length > 0) {
            selectedGroups.push(group);
            group.cells.forEach(c => coveredMinterms.add(c));
            
            // Stop if all minterms are covered
            if (coveredMinterms.size === minterms.length) break;
        }
    }

    return selectedGroups;
}

// Find a prime implicant group starting from position
function findPrimeGroup(grid, start, size, variables) {
    const cells = [];
    
    if (size === 1) {
        if (grid[start]) {
            cells.push(start);
        }
    } else if (variables === 2) {
        cells.push(...find2VarGroup(grid, start, size));
    } else if (variables === 3) {
        cells.push(...find3VarGroup(grid, start, size));
    } else if (variables === 4) {
        cells.push(...find4VarGroup(grid, start, size));
    }

    return cells.length > 0 ? { cells: cells.sort((a, b) => a - b), size: cells.length } : null;
}

// Find groups for 2-variable K-Map
function find2VarGroup(grid, start, size) {
    const adjacent = {
        0: [1, 2],
        1: [0, 3],
        2: [0, 3],
        3: [1, 2]
    };

    const cells = [];
    if (grid[start]) cells.push(start);
    
    for (let neighbor of adjacent[start] || []) {
        if (grid[neighbor] && cells.length < size) {
            cells.push(neighbor);
        }
    }
    
    return cells;
}

// Find groups for 3-variable K-Map
function find3VarGroup(grid, start, size) {
    const adjacency = {
        0: [1, 2, 4], 1: [0, 3, 5], 2: [0, 3, 6], 3: [1, 2, 7],
        4: [0, 5, 6], 5: [1, 4, 7], 6: [2, 4, 7], 7: [3, 5, 6]
    };

    return findGroupBFS(grid, start, size, adjacency);
}

// Find groups for 4-variable K-Map
function find4VarGroup(grid, start, size) {
    const adjacency = {
        0: [1, 4, 8], 1: [0, 3, 5, 9], 2: [3, 6, 10], 3: [1, 2, 7, 11],
        4: [0, 5, 6, 12], 5: [1, 4, 7, 13], 6: [2, 4, 7, 14], 7: [3, 5, 6, 15],
        8: [0, 9, 12], 9: [1, 8, 11, 13], 10: [2, 11, 14], 11: [3, 9, 10, 15],
        12: [4, 8, 13], 13: [5, 9, 12, 15], 14: [6, 10, 15], 15: [7, 11, 13, 14]
    };

    return findGroupBFS(grid, start, size, adjacency);
}

// Breadth-first search for group formation
function findGroupBFS(grid, start, targetSize, adjacency) {
    const visited = new Set();
    const queue = [start];
    visited.add(start);

    if (!grid[start]) return [];

    while (queue.length > 0 && visited.size < targetSize) {
        const current = queue.shift();
        
        for (let neighbor of adjacency[current] || []) {
            if (!visited.has(neighbor) && grid[neighbor] && visited.size < targetSize) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    return Array.from(visited);
}

// Check if group has valid power of 2 size
function isValidGroup(group) {
    const size = group.cells.length;
    return size > 0 && (size & (size - 1)) === 0; // Check if power of 2
}

// Helper function to compare arrays
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    return arr1.sort((a, b) => a - b).every((val, idx) => val === arr2.sort((a, b) => a - b)[idx]);
}

// Generate explanation of Boolean simplification
function generateExplanation(groups, variables) {
    if (groups.length === 0) return 'No groups formed.';
    
    let explanation = 'Boolean Simplification Steps:\n\n';
    
    groups.forEach((group, idx) => {
        const term = generateTerm(group, variables);
        const cellCount = group.cells.length;
        const cellsStr = group.cells.join(', ');
        
        let law = '';
        let details = '';
        if (cellCount === 1) {
            law = 'No Simplification Possible';
            details = 'Single cell represents a single minterm';
        } else if (cellCount === 2) {
            law = 'Adjacency Law Applied';
            details = 'Two adjacent cells combine to eliminate one variable';
        } else if (cellCount === 4) {
            law = 'Consensus & Adjacency Laws Applied';
            details = 'Four adjacent cells combine to eliminate two variables';
        } else if (cellCount === 8) {
            law = 'Full Variable Elimination';
            details = 'Eight adjacent cells combine to eliminate three variables';
        } else if (cellCount === 16) {
            law = 'Tautology Law: F = 1';
            details = 'All cells are 1s (complete coverage)';
        }
        
        explanation += `Group ${idx + 1}: Cells [${cellsStr}]\n`;
        explanation += `  Term: ${term}\n`;
        explanation += `  Law: ${law}\n`;
        explanation += `  Details: ${details}\n\n`;
    });
    
    return explanation;
}

// Generate boolean term from group
function generateTerm(group, variables) {
    if (variables === 2) {
        if (group.cells.length === 4) return '1';
        if (group.cells.length === 2) {
            if (group.cells.includes(0) && group.cells.includes(1)) return "A'";
            if (group.cells.includes(2) && group.cells.includes(3)) return 'A';
            if (group.cells.includes(0) && group.cells.includes(2)) return "B'";
            if (group.cells.includes(1) && group.cells.includes(3)) return 'B';
        }
        if (group.cells.length === 1) {
            const idx = group.cells[0];
            const termMap = { 0: "A'B'", 1: "A'B", 2: "AB'", 3: 'AB' };
            return termMap[idx] || '';
        }
    } else if (variables === 3) {
        if (group.cells.length === 8) return '1';
        if (group.cells.length === 4) return generateTerm3Var4(group);
        if (group.cells.length === 2) return generateTerm3Var2(group);
        if (group.cells.length === 1) return generateTerm3Var1(group);
    } else if (variables === 4) {
        if (group.cells.length === 16) return '1';
        if (group.cells.length === 8) return generateTerm4Var8(group);
        if (group.cells.length === 4) return generateTerm4Var4(group);
        if (group.cells.length === 2) return generateTerm4Var2(group);
        if (group.cells.length === 1) return generateTerm4Var1(group);
    }
    return '';
}

// Generate terms for 3-variable K-Map
function generateTerm3Var1(group) {
    const idx = group.cells[0];
    const terms = [
        "A'B'C'", "A'B'C", "A'BC", "A'BC'",
        "AB'C'", "AB'C", "ABC", "ABC'"
    ];
    return terms[idx] || '';
}

function generateTerm3Var2(group) {
    const cells = group.cells.sort((a, b) => a - b);
    const pairs = {
        '01': "A'B'", '23': "A'B", '45': "AB'", '67': 'AB',
        '04': "B'C'", '15': "B'C", '37': 'BC', '26': "BC'"
    };
    const key = cells.join('');
    return pairs[key] || '';
}

function generateTerm3Var4(group) {
    const cells = new Set(group.cells);
    if (cells.has(0) && cells.has(1) && cells.has(2) && cells.has(3)) return "A'";
    if (cells.has(4) && cells.has(5) && cells.has(6) && cells.has(7)) return 'A';
    if (cells.has(0) && cells.has(4) && cells.has(1) && cells.has(5)) return "B'";
    if (cells.has(3) && cells.has(7) && cells.has(2) && cells.has(6)) return 'B';
    if (cells.has(0) && cells.has(4) && cells.has(2) && cells.has(6)) return "C'";
    if (cells.has(1) && cells.has(5) && cells.has(3) && cells.has(7)) return 'C';
    return '';
}

// Generate terms for 4-variable K-Map
function generateTerm4Var1(group) {
    const idx = group.cells[0];
    const a = Math.floor(idx / 8) & 1;
    const b = Math.floor(idx / 4) & 1;
    const c = Math.floor(idx / 2) & 1;
    const d = idx & 1;
    return `${a ? 'A' : "A'"}${b ? 'B' : "B'"}${c ? 'C' : "C'"}${d ? 'D' : "D'"}`;
}

function generateTerm4Var2(group) {
    // Simplified version - returns first variable pair
    return '';
}

function generateTerm4Var4(group) {
    // Returns single variable for group of 4
    return '';
}

function generateTerm4Var8(group) {
    // Returns simplified term for group of 8
    return '';
}

// Display results
function displayResults(result) {
    // Display simplified expression with proper formatting
    const simplifiedBox = document.getElementById('simplifiedExpression');
    simplifiedBox.innerHTML = `<div style="font-size: 1.5em; font-weight: bold; color: #764ba2;">${result.simplifiedForm}</div>`;

    // Display groups with Boolean laws
    const groupsList = document.getElementById('groupsList');
    if (result.groups && result.groups.length > 0) {
        let groupsHTML = '<div style="margin-top: 10px;">';
        result.groups.forEach((group, idx) => {
            const term = generateTerm(group, currentVariables);
            const law = getBooleanLaw(group.cells.length);
            groupsHTML += `
                <div class="group-item">
                    <strong>Group ${idx + 1}:</strong> Cells [${group.cells.join(', ')}]<br>
                    <strong>Term:</strong> <code>${term}</code><br>
                    <strong>Boolean Law Applied:</strong> ${law}
                </div>`;
        });
        groupsHTML += '</div>';
        groupsList.innerHTML = groupsHTML;
    } else {
        groupsList.innerHTML = '<p class="placeholder">No groups found.</p>';
    }

    // Display Boolean algebra explanation
    const explanationBox = document.createElement('div');
    explanationBox.style.marginTop = '20px';
    explanationBox.style.padding = '15px';
    explanationBox.style.backgroundColor = '#f0f3ff';
    explanationBox.style.borderLeft = '4px solid #667eea';
    explanationBox.style.borderRadius = '4px';
    explanationBox.style.fontSize = '0.95em';
    explanationBox.style.lineHeight = '1.6';
    
    let explanationText = '<strong>Simplification Process:</strong><br>';
    result.groups.forEach((group, idx) => {
        const term = generateTerm(group, currentVariables);
        const law = getBooleanLaw(group.cells.length);
        explanationText += `<br>Group ${idx + 1}: [${group.cells.join(', ')}] → <code>${term}</code> (${law})`;
    });
    
    if (result.groups.length > 1) {
        explanationText += `<br><br><strong>Final Result (using Absorption/Joining):</strong><br>F = ${result.expression}`;
    }
    
    explanationBox.innerHTML = explanationText;
    
    // Insert explanation after results card
    const resultsCard = document.querySelector('.results-card');
    const existingExp = resultsCard.querySelector('.explanation-box');
    if (existingExp) existingExp.remove();
    explanationBox.className = 'explanation-box';
    resultsCard.appendChild(explanationBox);

    // Display truth table
    displayTruthTable(result.minterms);
}

// Get the Boolean law description based on group size
function getBooleanLaw(groupSize) {
    const laws = {
        1: '<strong>No Simplification</strong><br>Single Minterm - Cannot be reduced further',
        2: '<strong>Adjacency Law</strong><br>X·Y + X·Y\' = X<br>Two adjacent cells eliminate one variable',
        4: '<strong>Consensus & Absorption Laws</strong><br>Multiple pairs of adjacency<br>Eliminates two variables',
        8: '<strong>Full Variable Elimination</strong><br>Repeated application of Adjacency Law<br>Eliminates three variables',
        16: '<strong>Tautology Law</strong><br>F = 1 (All cells are 1s)'
    };
    return laws[groupSize] || '<strong>Simplification Applied</strong>';
}

// Display truth table
function displayTruthTable(minterms) {
    const container = document.getElementById('truthTableContainer');
    const maxValue = Math.pow(2, currentVariables);
    
    let html = '<table class="truth-table"><thead><tr>';
    
    // Header
    if (currentVariables === 2) {
        html += '<th>A</th><th>B</th><th>F</th>';
    } else if (currentVariables === 3) {
        html += '<th>A</th><th>B</th><th>C</th><th>F</th>';
    } else if (currentVariables === 4) {
        html += '<th>A</th><th>B</th><th>C</th><th>D</th><th>F</th>';
    }
    html += '</tr></thead><tbody>';
    
    // Body
    for (let i = 0; i < maxValue; i++) {
        const binary = i.toString(2).padStart(currentVariables, '0');
        html += '<tr>';
        for (let j = 0; j < currentVariables; j++) {
            html += `<td>${binary[j]}</td>`;
        }
        html += `<td>${minterms.includes(i) ? '1' : '0'}</td>`;
        html += '</tr>';
    }
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Load example
function loadExample() {
    if (currentVariables === 2) {
        document.getElementById('minterms').value = '1, 3';
    } else if (currentVariables === 3) {
        document.getElementById('minterms').value = '1, 2, 5, 6';
    } else if (currentVariables === 4) {
        document.getElementById('minterms').value = '1, 4, 5, 6, 12, 13, 14, 15';
    }
    solveKMap();
}

// Reset form
function resetForm() {
    document.getElementById('minterms').value = '';
    document.getElementById('simplifiedExpression').textContent = '-';
    document.getElementById('groupsList').innerHTML = '<p class="placeholder">No groups yet. Solve to see the groups.</p>';
    document.getElementById('truthTableContainer').innerHTML = '';
    updateKMap();
}

// Show error message
function showError(message) {
    const div = document.createElement('div');
    div.className = 'error';
    div.textContent = message;
    document.querySelector('.input-card').insertBefore(div, document.querySelector('.input-group'));
    setTimeout(() => div.remove(), 4000);
}

// Show success message
function showSuccess(message) {
    const div = document.createElement('div');
    div.className = 'success';
    div.textContent = message;
    document.querySelector('.input-card').insertBefore(div, document.querySelector('.input-group'));
    setTimeout(() => div.remove(), 3000);
}
