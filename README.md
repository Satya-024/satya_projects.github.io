# Karnaugh Map (K-Map) Simplifier

A comprehensive Boolean algebra simplification tool with both **Web Interface** and **Python Backend**.

## Features

✅ **Support for Multiple Variables**
- 2-variable K-Maps (2×2)
- 3-variable K-Maps (2×4)
- 4-variable K-Maps (4×4)

✅ **Boolean Law Explanations**
- Adjacency Law: X·Y + X·Y' = X
- Consensus & Absorption Laws
- Full variable elimination techniques
- Each group shows which Boolean law is applied

✅ **Prime Implicant Selection**
- Finds all prime implicants (largest groups first)
- Uses greedy algorithm for optimal coverage
- Minimizes number of terms in final expression

✅ **Complete Simplification Process**
- Shows all groups formed
- Displays cells included in each group
- Explains Boolean laws applied
- Provides step-by-step simplification

## Files

- **index.html** - Interactive web interface
- **style.css** - Modern styling and responsive design
- **script.js** - Web-based K-Map solver (550+ lines)
- **kmap.py** - Python K-Map simplifier class
- **test_kmap.py** - Test script for Python backend
- **test_input.txt** - Sample input file

## How to Use

### Web Interface

1. Open `index.html` in any web browser
2. Select number of variables (2, 3, or 4)
3. Enter minterms (comma-separated, e.g., `1,2,5,6`)
4. Click "Solve K-Map"
5. View:
   - Simplified Boolean expression with proper notation
   - Groups formed with Boolean laws applied
   - Truth table for verification
   - Step-by-step simplification explanation

### Python Backend

```python
from kmap import KMapSimplifier

# Create K-Map for 3 variables with minterms 1,2,5,6
kmap = KMapSimplifier(3, [1, 2, 5, 6])
kmap.validate_minterms()

# Display K-Map
print(kmap.display_kmap())

# Simplify
result = kmap.simplify()
print(result['simplified_form'])
print(result['explanation'])
```

Or run interactively:
```bash
python kmap.py
```

## K-Map Simplification Process

### Step 1: Prime Implicant Search
- Find all possible rectangular groups (size = power of 2)
- Groups can be 1, 2, 4, 8, or 16 cells
- Larger groups have priority (more simplification)

### Step 2: Coverage Analysis
- Select groups that cover all minterms
- Use greedy algorithm for minimal term count
- Each minterm must be covered at least once

### Step 3: Term Generation
- Convert each group to simplified Boolean term
- Larger groups eliminate more variables
- Group of 2: One variable eliminated
- Group of 4: Two variables eliminated

### Step 4: Boolean Expression
- Combine all terms using OR (+)
- Final simplified form: F = term1 + term2 + ...
- Minimal number of operations

## Boolean Laws Applied

| Group Size | Law | Example |
|-----------|------|---------|
| 1 | No Simplification | F = A'B'C |
| 2 | Adjacency Law | AB + AB' = A |
| 4 | Consensus & Absorption | Multiple laws combined |
| 8 | Full Variable Elimination | Eliminates single variable |
| 16 | Tautology | F = 1 |

## Example: 3-Variable K-Map

**Input:** Minterms 1, 2, 5, 6
```
      B'C'  B'C   BC   BC'
A'     0    1    0    1      (Groups: 1,3 and 2,6)
A      0    1    1    0      (Groups: 5,7 and 4,6)
```

**Groups Found:**
- Group 1: [1, 3] → A'C (Adjacency Law)
- Group 2: [5, 7] → AC (Adjacency Law)
- Group 3: [2, 6] → BC' (Adjacency Law)

**Simplified Expression:** F = A'C + AC + BC'

**Further Simplified:** F = C + BC' = C + B·C' (using Adjacency)

## Features in Web Interface

### Interactive K-Map
- Click cells to toggle between 0 and 1
- Real-time updates
- Visual feedback with color coding

### Results Display
- Simplified Boolean expression in proper notation
- Each group with Boolean law applied
- Detailed explanation box
- Complete truth table

### Input Modes
- Direct minterm entry
- Interactive cell clicking
- Load example for each variable count
- Reset and recalculate

## Technical Details

### JavaScript (550+ lines)
- Prime implicant finding algorithm
- Greedy coverage selection
- Boolean term generation
- Comprehensive UI updates
- Error handling and validation

### Python (300+ lines)
- Object-oriented KMapSimplifier class
- Adjacency mappings for 2, 3, 4 variables
- BFS for group finding
- Boolean law descriptions
- ASCII K-Map display

## Browser Compatibility

- Chrome/Chromium
- Firefox
- Safari
- Edge
- Any modern browser with ES6+ support

## Python Requirements

- Python 3.6+
- No external dependencies

## Examples

### 2-Variable Example
Minterms: 1, 3
- Result: F = B

### 3-Variable Example
Minterms: 0, 1, 4, 5
- Result: F = B'

### 4-Variable Example
Minterms: 1, 4, 5, 6, 12, 13, 14, 15
- Result: F = CD + A'B'C + AB'D (or simplified further)

## Educational Use

Perfect for students learning:
- Digital Logic Design
- Boolean Algebra
- Circuit Minimization
- Karnaugh Map technique
- Prime Implicant method

## License

Free to use for educational purposes.

## Author

K-Map Solver Tool - November 2025
