package assigment1.ds.ds.service;

import assigment1.ds.ds.sortingAlgorithms.*;
import assigment1.ds.ds.DTO.SortingResultDTO;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class SortService{
    private final static int maxVisualizationSize = 100;
    private final static String[] algorithm = {"Bubble Sort", "Heap Sort", "Insertion Sort", "Merge Sort", "Quick Sort", "Selection Sort"};

    public visualization resolveAlgorithm(int type) {
        return switch (type) {
            case 1    -> new bubbleSort();
            case 2      -> new heapSort();
            case 3 -> new insertionSort();
            case 4     -> new mergeSort();
            case 5     -> new quickSort();
            case 6 -> new selectionSort();
            default -> throw new IllegalArgumentException("Invalid algorithm type: " + type);
        };
    }
    
    public SortingResultDTO sortWithVisualization(int[] arr, int type) {
        if (arr.length > maxVisualizationSize) throw new IllegalArgumentException("Array size for visualization must be between 1 and " + maxVisualizationSize);
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

}