package assigment1.ds.ds.sortingAlgorithms;

import lombok.NoArgsConstructor;
import java.util.List;

@NoArgsConstructor
public class heapSort implements visualization {
    @Override
    public void sort(int[] arr, List<int[]> frames, SortStats stats) {
        int arraySize = arr.length;

        for (int i = arraySize / 2 - 1; i >= 0; i--)
            heapify(arr, arraySize, i, frames, stats);

        for (int i = arraySize - 1; i > 0; i--) {
            int temp = arr[0];
            arr[0] = arr[i];
            arr[i] = temp;
            if (stats != null) stats.incrementSwaps();
            if(frames != null) frames.add(arr.clone());
            heapify(arr, i, 0, frames, stats);
        }
    }

    private static void heapify(int[] arr, int n, int i, List<int[]> frames, SortStats stats) {
        int parent = i; 
        int leftChild = 2 * i + 1; 
        int rightChild = 2 * i + 2; 

        if (leftChild < n) {
            if (stats != null) stats.incrementComparisons();
            if (arr[leftChild] > arr[parent]) parent = leftChild;
        }

        if (rightChild < n) {
            if (stats != null) stats.incrementComparisons();
            if (arr[rightChild] > arr[parent]) parent = rightChild;
        }

        if (parent != i) {
            int temp1 = arr[i];
            arr[i] = arr[parent];
            arr[parent] = temp1;
            if (stats != null) stats.incrementSwaps();
            if(frames != null) frames.add(arr.clone());
            heapify(arr, n, parent, frames, stats);
        }
    }
}