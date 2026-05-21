/**
 * Bubble Sort Algorithm with User Input
 * 
 * Bubble Sort repeatedly steps through the list, compares adjacent elements,
 * and swaps them if they're in the wrong order. The pass through the list
 * is repeated until the list is sorted.
 */

// Main function to run the bubble sort program
function runBubbleSort() {
    console.log("=" .repeat(50));
    console.log("🔄 BUBBLE SORT VISUALIZER");
    console.log("=" .repeat(50));
    console.log("\nBubble Sort works by repeatedly stepping through the list,");
    console.log("comparing adjacent elements and swapping them if they're in the wrong order.\n");
    
    // Get array from user
    const userArray = getArrayFromUser();
    
    if (!userArray || userArray.length === 0) {
        console.log("❌ No valid array provided. Exiting...");
        return;
    }
    
    console.log("\n📊 Original Array:", userArray);
    console.log("-".repeat(50));
    
    // Perform bubble sort with visualization
    const { sortedArray, steps, comparisons, swaps } = bubbleSortWithSteps([...userArray]);
    
    // Display results
    console.log("\n✅ Sorted Array:", sortedArray);
    console.log("-".repeat(50));
    console.log("\n📈 SORTING STATISTICS:");
    console.log(`   • Total Comparisons: ${comparisons}`);
    console.log(`   • Total Swaps: ${swaps}`);
    console.log(`   • Total Passes: ${steps.length}`);
    console.log(`   • Array Length: ${userArray.length}`);
    
    // Display step-by-step visualization
    displaySteps(steps);
    
    return { sortedArray, steps, comparisons, swaps };
}

// Function to get array from user (works in browser and Node.js)
function getArrayFromUser() {
    // Check if running in browser
    if (typeof window !== 'undefined' && window.prompt) {
        return getArrayFromBrowser();
    } 
    // Check if running in Node.js
    else if (typeof process !== 'undefined' && process.stdin) {
        return getArrayFromNode();
    }
    else {
        // Default array for demonstration
        console.log("📝 Using default array: [64, 34, 25, 12, 22, 11, 90]");
        return [64, 34, 25, 12, 22, 11, 90];
    }
}

// Get array from browser environment
function getArrayFromBrowser() {
    let input = prompt("Enter numbers separated by commas (e.g., 5,3,8,1,9):", "64,34,25,12,22,11,90");
    
    if (!input) {
        return null;
    }
    
    // Parse the input
    const numbers = input.split(',')
        .map(item => parseFloat(item.trim()))
        .filter(num => !isNaN(num));
    
    if (numbers.length === 0) {
        alert("Please enter valid numbers!");
        return getArrayFromBrowser();
    }
    
    return numbers;
}

// Get array from Node.js environment
function getArrayFromNode() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question("Enter numbers separated by commas (e.g., 5,3,8,1,9): ", (answer) => {
            const numbers = answer.split(',')
                .map(item => parseFloat(item.trim()))
                .filter(num => !isNaN(num));
            
            rl.close();
            resolve(numbers.length > 0 ? numbers : null);
        });
    });
}

// Bubble sort algorithm with step tracking
function bubbleSortWithSteps(arr) {
    const steps = [];
    let comparisons = 0;
    let swaps = 0;
    const n = arr.length;
    
    // Record initial state
    steps.push({
        pass: 0,
        array: [...arr],
        comparisons: 0,
        swaps: 0,
        description: "Initial array"
    });
    
    // Bubble sort algorithm
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        let passComparisons = 0;
        let passSwaps = 0;
        
        // Last i elements are already in place
        for (let j = 0; j < n - i - 1; j++) {
            comparisons++;
            passComparisons++;
            
            // Compare adjacent elements
            if (arr[j] > arr[j + 1]) {
                // Swap elements
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swaps++;
                passSwaps++;
                swapped = true;
            }
        }
        
        // Record step
        steps.push({
            pass: i + 1,
            array: [...arr],
            comparisons: passComparisons,
            swaps: passSwaps,
            description: `Pass ${i + 1}: ${passSwaps > 0 ? `Made ${passSwaps} swaps` : "No swaps needed"}`,
            swapped: swapped
        });
        
        // If no swapping occurred, array is sorted
        if (!swapped) {
            steps.push({
                pass: i + 1,
                array: [...arr],
                comparisons: 0,
                swaps: 0,
                description: `✅ Array is sorted! Stopping early.`,
                earlyStop: true
            });
            break;
        }
    }
    
    return { sortedArray: arr, steps, comparisons, swaps };
}

// Display step-by-step visualization
function displaySteps(steps) {
    console.log("\n" + "=".repeat(50));
    console.log("📖 STEP-BY-STEP VISUALIZATION");
    console.log("=".repeat(50));
    
    steps.forEach((step, index) => {
        if (step.pass === 0) {
            console.log(`\n📍 ${step.description}:`);
            console.log(`   ${step.array.join(" → ")}`);
        } else {
            console.log(`\n📍 Pass ${step.pass}:`);
            console.log(`   Before: ${step.array.join(" → ")}`);
            console.log(`   📊 Comparisons: ${step.comparisons}, Swaps: ${step.swaps}`);
            console.log(`   💡 ${step.description}`);
            
            // Visual representation with arrows
            if (step.swaps > 0) {
                console.log(`   🔄 ${step.array.join(" → ")}`);
            }
        }
    });
}

// Visual bubble sort with animation (for browser)
class BubbleSortVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.array = [];
        this.isSorting = false;
    }
    
    // Set array from user input
    setArray(arr) {
        this.array = [...arr];
        this.render();
    }
    
    // Render the array as visual bars
    render() {
        if (!this.container) return;
        
        const maxValue = Math.max(...this.array, 1);
        this.container.innerHTML = '';
        
        this.array.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.height = `${(value / maxValue) * 100}%`;
            bar.style.width = `${100 / this.array.length}%`;
            bar.textContent = value;
            bar.setAttribute('data-index', index);
            this.container.appendChild(bar);
        });
    }
    
    // Animate bubble sort
    async animateBubbleSort(delay = 500) {
        if (this.isSorting) return;
        this.isSorting = true;
        
        const arr = [...this.array];
        const n = arr.length;
        const bars = document.querySelectorAll('.bar');
        
        for (let i = 0; i < n - 1; i++) {
            let swapped = false;
            
            for (let j = 0; j < n - i - 1; j++) {
                // Highlight comparing elements
                this.highlightBars([j, j + 1], 'comparing');
                await this.sleep(delay);
                
                if (arr[j] > arr[j + 1]) {
                    // Highlight swapping elements
                    this.highlightBars([j, j + 1], 'swapping');
                    await this.sleep(delay);
                    
                    // Swap
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    swapped = true;
                    
                    // Update display
                    this.array = [...arr];
                    this.render();
                    this.highlightBars([j, j + 1], 'swapped');
                    await this.sleep(delay);
                }
                
                // Reset highlight
                this.highlightBars([j, j + 1], 'default');
            }
            
            // Mark sorted elements
            this.highlightBars([n - i - 1], 'sorted');
            
            if (!swapped) break;
        }
        
        // Mark all as sorted
        this.highlightAllBars('sorted');
        this.isSorting = false;
    }
    
    // Helper functions for visualization
    highlightBars(indices, state) {
        const bars = document.querySelectorAll('.bar');
        bars.forEach((bar, idx) => {
            bar.classList.remove('comparing', 'swapping', 'sorted');
            if (indices.includes(idx)) {
                bar.classList.add(state);
            }
        });
    }
    
    highlightAllBars(state) {
        const bars = document.querySelectorAll('.bar');
        bars.forEach(bar => {
            bar.classList.remove('comparing', 'swapping');
            bar.classList.add(state);
        });
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Simple bubble sort (no visualization)
function bubbleSortSimple(arr) {
    const array = [...arr];
    const n = array.length;
    
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

// Optimized bubble sort with flag
function bubbleSortOptimized(arr) {
    const array = [...arr];
    let n = array.length;
    let comparisons = 0;
    let swaps = 0;
    
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        let lastSwap = 0;
        
        for (let j = 0; j < n - i - 1; j++) {
            comparisons++;
            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                swaps++;
                swapped = true;
                lastSwap = j + 1;
            }
        }
        
        // Optimize: Reduce the range of inner loop
        n = lastSwap;
        
        if (!swapped) break;
    }
    
    return { sortedArray: array, comparisons, swaps };
}

// Export functions for different environments
if (typeof module !== 'undefined' && module.exports) {
    // Node.js export
    module.exports = {
        bubbleSortSimple,
        bubbleSortOptimized,
        bubbleSortWithSteps,
        BubbleSortVisualizer,
        runBubbleSort
    };
} else if (typeof window !== 'undefined') {
    // Browser export
    window.BubbleSort = {
        simple: bubbleSortSimple,
        optimized: bubbleSortOptimized,
        withSteps: bubbleSortWithSteps,
        Visualizer: BubbleSortVisualizer,
        run: runBubbleSort
    };
    
    // Auto-run if in browser
    console.log("🔄 Bubble Sort Library Loaded!");
    console.log("Call BubbleSort.run() to start, or BubbleSort.Visualizer for interactive visualization");
}

// If running directly, execute
if (typeof require !== 'undefined' && require.main === module) {
    runBubbleSort();
}
