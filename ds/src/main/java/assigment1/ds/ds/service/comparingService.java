package assigment1.ds.ds.service;

import assigment1.ds.ds.sortingAlgorithms.*;
import assigment1.ds.ds.DTO.*;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class comparingService {
    private final static int maxVisualizayionSize = 100;
    private final static int maxComparisonSize = 10000; 
    private static final int defaultRuns = 5;
    private static bubbleSort bubbleSort = new bubbleSort();
    private static heapSort heapSort = new heapSort();
    private static insertionSort insertionSort = new insertionSort();
    private static mergeSort mergeSort = new mergeSort();
    private static quickSort quickSort = new quickSort();
    private static selectionSort selectionSort = new selectionSort();
    private final static String[] algorithm = {"Bubble Sort", "Heap Sort", "Insertion Sort", "Merge Sort", "Quick Sort", "Selection Sort"};

    private visualization resolveAlgorithm(int type) {
        return switch (type) {
            case 1    -> bubbleSort;
            case 2      -> heapSort;
            case 3 -> insertionSort;
            case 4     -> mergeSort;
            case 5     -> quickSort;
            case 6 -> selectionSort;
            default -> throw new IllegalArgumentException("Invalid algorithm type: " + type);
        };
    }
    
    public SortingResultDTO sortWithVisualization(int[] arr, int type) {
        if (arr.length > maxVisualizayionSize) throw new IllegalArgumentException("Array size for visualization must be between 1 and " + maxVisualizayionSize);
        visualization sorter = resolveAlgorithm(type);
        SortStats stats = new SortStats();
        int[] copy = arr.clone();
        
        long start = System.nanoTime();
        List <int[]> frames = sorter.sortWithFrames(copy, stats);
        long finish = System.nanoTime() - start;

        return new SortingResultDTO(algorithm[type-1], frames, copy, finish, stats);
    }

    public SortingResultDTO sortWithoutVisualization(int[] arr, int type) {
        visualization sorter = resolveAlgorithm(type);
        SortStats stats = new SortStats();
        int[] copy = arr.clone();
        long start = System.nanoTime();
        sorter.sort(copy, null, stats);
        long finish = System.nanoTime() - start;
        return new SortingResultDTO(algorithm[type-1], null, copy, finish, stats);
    }

    public ComparisonResultDTO compareAllAlgorithms(int[] arr, String arraySource, int runs) {
        if (runs < 1) runs = defaultRuns;

        List<AlgorithmComparisonRow> rows = new ArrayList<>();

        for (int i = 1; i <= 6; i++) {
            visualization sorter = resolveAlgorithm(i);

            long   totalTime   = 0;
            long   minTime     = Long.MAX_VALUE;
            long   maxTime     = Long.MIN_VALUE;
            long   comparisons = 0;
            long   interchanges = 0;

            for (int run = 0; run < runs; run++) {
                SortStats stats = new SortStats();
                int[] copy = arr.clone();

                long start  = System.nanoTime();
                sorter.sort(copy, null, stats);  
                long finish = System.nanoTime() - start;

                totalTime   += finish;
                minTime      = Math.min(minTime, finish);
                maxTime      = Math.max(maxTime, finish);
                comparisons  = stats.getComparisons();
                interchanges = stats.getSwaps();
            }

            rows.add(new AlgorithmComparisonRow(algorithm[i - 1], arr.length, arraySource, runs, totalTime / runs, minTime, maxTime, comparisons, interchanges));
        }

        ComparisonResultDTO result = new ComparisonResultDTO(arr.length, arraySource, rows);
        writeResultsToCsv(result);
        return result;
    }

    public ComparisonResultDTO compareAllAlgorithms(int[] arr, int arrayType) {
        return compareAllAlgorithms(arr, arraySourceLabel(arrayType), defaultRuns);
    }

    private void writeResultsToCsv(ComparisonResultDTO result) {
        String filename = "comparison_results_" + System.currentTimeMillis() + ".csv";

        try (FileWriter writer = new FileWriter(filename)) {
            writer.write("Algorithm Name,Array Size,Array Source,Number of Runs," + "Average Runtime (ns),Min Runtime (ns),Max Runtime (ns)," + "Comparisons,Interchanges\n");

            for (AlgorithmComparisonRow row : result.getRows()) {
                writer.write(String.format("%s,%d,%s,%d,%d,%d,%d,%d,%d\n",
                    row.getAlgorithmName(), row.getArraySize(), row.getArraySource(),
                    row.getNumberOfRuns(), row.getAverageRuntimeNanos(), row.getMinRuntimeNanos(),
                    row.getMaxRuntimeNanos(), row.getComparisons(), row.getInterchanges()
                ));
            }

        } catch (IOException e) {
            throw new RuntimeException("Failed to write comparison CSV: " + e.getMessage(), e);
        }
    }

    public int[] generateArray(int size, int type) {
        if(size > maxComparisonSize) throw new IllegalArgumentException("Array size must be between 1 and " + maxComparisonSize);
        return switch (type) {
            case 1 -> generateRandomArray(size);
            case 2 -> generateSortedArray(size);
            case 3 -> generateReverseSortedArray(size);
            default -> throw new IllegalArgumentException("Invalid array type: " + type);
        };
    }

    public String arraySourceLabel(int type) {
        return switch (type) {
            case 1 -> "Random";
            case 2 -> "Sorted";
            case 3 -> "Inversely Sorted";
            default -> throw new IllegalArgumentException("Invalid array type: " + type);
        };
    }

    private int[] generateRandomArray(int size) {
        int[] arr = new int[size];
        for (int i = 0; i < size; i++) arr[i] = (int) (Math.random() * 10000);
        return arr;
    }

    private int[] generateSortedArray(int size) {
        int[] arr = new int[size];
        int val = (int) (Math.random() * 100);
        for (int i = 0; i < size; i++) {
            arr[i] = val;
            val += (int) (Math.random() * 10) + 1;
        }
        return arr;
    }

    private int[] generateReverseSortedArray(int size) {
        int[] arr = new int[size];
        int val = (int) (Math.random() * 100) + size * 10;
        for (int i = 0; i < size; i++) {
            arr[i] = val;
            val -= (int) (Math.random() * 10) + 1;
        }
        return arr;
    }
}
