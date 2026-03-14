package assigment1.ds.ds.service;

import org.springframework.stereotype.Service;

@Service
public class ArrayService {
    private final static int maxComparisonSize = 10000; 

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