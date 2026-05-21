// BUBBLE SORT - Complete working code

// Get array from user
function getArrayFromUser() {
    let input = prompt("Enter numbers separated by commas (e.g., 5,3,8,1,9):", "64,34,25,12,22,11,90");
    
    if (!input) {
        return [64, 34, 25, 12, 22, 11, 90]; // Default array
    }
    
    let numbers = input.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    
    if (numbers.length === 0) {
        alert("Please enter valid numbers!");
        return getArrayFromUser();
    }
    
    return numbers;
}

// Bubble Sort Algorithm
function bubbleSort(arr) {
    let array = [...arr];
    let steps = [];
    let comparisons = 0;
    let swaps = 0;
    let n = array.length;
    
    // Record initial state
    steps.push({
        step: 0,
        array: [...array],
        description: "Original array"
    });
    
    // Bubble sort logic
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        
        for (let j = 0; j < n - i - 1; j++) {
            comparisons++;
            
            if (array[j] > array[j + 1]) {
                // Swap elements
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                swaps++;
                swapped = true;
            }
        }
        
        // Record this pass
        steps.push({
            step: i + 1,
            array: [...array],
            comparisons: comparisons,
            swaps: swaps,
            description: `Pass ${i + 1}: ${swapped ? 'Swapped elements' : 'No swaps needed - array sorted!'}`
        });
        
        // If no swaps, array is sorted
        if (!swapped) break;
    }
    
    return { sortedArray: array, steps, comparisons, swaps };
}

// Display results in console
function displayResults(result, originalArray) {
    console.log("=" .repeat(60));
    console.log("BUBBLE SORT RESULTS");
    console.log("=" .repeat(60));
    console.log("Original Array:", originalArray);
    console.log("Sorted Array:  ", result.sortedArray);
    console.log("-" .repeat(60));
    console.log("STATISTICS:");
    console.log("  • Total Comparisons:", result.comparisons);
    console.log("  • Total Swaps:", result.swaps);
    console.log("  • Array Size:", originalArray.length);
    console.log("=" .repeat(60));
    
    // Show steps
    console.log("\nSTEP BY STEP PROCESS:");
    console.log("-" .repeat(60));
    result.steps.forEach(step => {
        console.log(`Step ${step.step}: ${step.description}`);
        console.log(`  Array: [${step.array.join(", ")}]`);
    });
}

// Visual bubble sort with HTML
function createVisualizer() {
    // Create container if it doesn't exist
    let container = document.getElementById('bubbleSortContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'bubbleSortContainer';
        document.body.appendChild(container);
    }
    
    container.innerHTML = `
        <style>
            .bubble-sort-viz {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 20px auto;
                padding: 20px;
                background: #f5f5f5;
                border-radius: 10px;
            }
            .array-container {
                display: flex;
                justify-content: center;
                align-items: flex-end;
                gap: 5px;
                margin: 20px 0;
                min-height: 200px;
            }
            .bar {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                text-align: center;
                padding: 10px 5px;
                border-radius: 5px;
                transition: all 0.3s ease;
                min-width: 40px;
            }
            .comparing {
                background: #ff9800;
                transform: scale(1.05);
            }
            .swapping {
                background: #ff4757;
                transform: scale(1.1);
            }
            .sorted {
                background: #4CAF50;
            }
            button {
                background: #667eea;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                margin: 5px;
            }
            button:hover {
                background: #764ba2;
            }
            input {
                padding: 10px;
                margin: 10px;
                border: 1px solid #ccc;
                border-radius: 5px;
                width: 300px;
            }
            .stats {
                background: white;
                padding: 15px;
                border-radius: 5px;
                margin-top: 20px;
            }
            h3 {
                margin: 10px 0;
                color: #333;
            }
        </style>
        
        <div class="bubble-sort-viz">
            <h2>🔄 Bubble Sort Visualizer</h2>
            
            <div>
                <input type="text" id="arrayInput" placeholder="Enter numbers (e.g., 64,34,25,12)" value="64,34,25,12,22,11,90">
                <button onclick="startBubbleSort()">Start Sorting</button>
                <button onclick="generateRandom()">Random Array</button>
            </div>
            
            <div class="array-container" id="arrayContainer"></div>
            
            <div class="stats">
                <h3>Statistics:</h3>
                <p id="stats">Click "Start Sorting" to begin</p>
            </div>
        </div>
    `;
    
    // Add global functions
    window.startBubbleSort = async function() {
        const input = document.getElementById('arrayInput').value;
        let numbers = input.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        
        if (numbers.length === 0) {
            alert('Please enter valid numbers!');
            return;
        }
        
        await animateBubbleSort(numbers);
    };
    
    window.generateRandom = function() {
        const length = Math.floor(Math.random() * 8) + 5;
        const randomArray = Array.from({ length }, () => Math.floor(Math.random() * 90) + 10);
        document.getElementById('arrayInput').value = randomArray.join(',');
        displayArray(randomArray);
    };
    
    function displayArray(arr, comparing = [], swapping = [], sorted = []) {
        const container = document.getElementById('arrayContainer');
        const maxVal = Math.max(...arr, 1);
        
        container.innerHTML = arr.map((val, idx) => {
            let className = 'bar';
            if (comparing.includes(idx)) className += ' comparing';
            if (swapping.includes(idx)) className += ' swapping';
            if (sorted.includes(idx)) className += ' sorted';
            
            const height = (val / maxVal) * 150 + 40;
            
            return `<div class="${className}" style="height: ${height}px; line-height: ${height}px;">
                        ${val}
                    </div>`;
        }).join('');
    }
    
    async function animateBubbleSort(arr) {
        let array = [...arr];
        let n = array.length;
        let comparisons = 0;
        let swaps = 0;
        let passes = 0;
        
        const statsDiv = document.getElementById('stats');
        displayArray(array);
        await sleep(1000);
        
        for (let i = 0; i < n - 1; i++) {
            let swapped = false;
            passes++;
            
            for (let j = 0; j < n - i - 1; j++) {
                comparisons++;
                
                // Highlight comparing elements
                displayArray(array, [j, j + 1]);
                await sleep(300);
                
                if (array[j] > array[j + 1]) {
                    // Highlight swapping
                    displayArray(array, [], [j, j + 1]);
                    await sleep(300);
                    
                    // Swap
                    [array[j], array[j + 1]] = [array[j + 1], array[j]];
                    swaps++;
                    swapped = true;
                    
                    // Display after swap
                    displayArray(array);
                    await sleep(300);
                }
            }
            
            // Mark last element as sorted
            displayArray(array, [], [], [n - i - 1]);
            
            statsDiv.innerHTML = `
                <strong>Pass ${passes}:</strong><br>
                Comparisons: ${comparisons}<br>
                Swaps: ${swaps}<br>
                Current Array: [${array.join(", ")}]
            `;
            
            await sleep(500);
            
            if (!swapped) {
                statsDiv.innerHTML += `<br><strong>✅ Array is sorted! Stopping early.</strong>`;
                break;
            }
        }
        
        // Mark all as sorted
        displayArray(array, [], [], array.map((_, idx) => idx));
        statsDiv.innerHTML += `<br><br><strong>✅ SORTING COMPLETE!</strong><br>
                               Total Comparisons: ${comparisons}<br>
                               Total Swaps: ${swaps}<br>
                               Total Passes: ${passes}`;
    }
    
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Display initial array
    displayArray([64, 34, 25, 12, 22, 11, 90]);
}

// Simple bubble sort (returns sorted array)
function bubbleSortSimple(arr) {
    let array = [...arr];
    let n = array.length;
    
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
            }
        }
    }
    
    return array;
}

// Optimized bubble sort with early stop
function bubbleSortOptimized(arr) {
    let array = [...arr];
    let n = array.length;
    
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        
        for (let j = 0; j < n - i - 1; j++) {
            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                swapped = true;
            }
        }
        
        if (!swapped) break;
    }
    
    return array;
}

// Main execution
if (typeof window !== 'undefined') {
    // Browser environment
    window.addEventListener('DOMContentLoaded', () => {
        createVisualizer();
    });
    
    // Console version
    console.log("Bubble Sort Loaded!");
    console.log("Run: bubbleSortWithPrompt() to sort your own array");
    
    window.bubbleSortWithPrompt = function() {
        const array = getArrayFromUser();
        const result = bubbleSort(array);
        displayResults(result, array);
        return result;
    };
} else {
    // Node.js environment
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.question("Enter numbers separated by commas: ", (answer) => {
        const numbers = answer.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        const result = bubbleSort(numbers);
        displayResults(result, numbers);
        rl.close();
    });
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { bubbleSort, bubbleSortSimple, bubbleSortOptimized };
}
