package assigment1.ds.ds.sortingAlgorithms;

import java.util.List;
import lombok.NoArgsConstructor;

@NoArgsConstructor
public class quickSort implements visualization {
    @Override
    public void sort(int[] arr, List<int[]> frames, SortStats stats) {
        recursiveQuickSort(arr, 0, arr.length - 1, frames, stats);
    }

    private void recursiveQuickSort(int[] arr, int low, int high, List<int[]> frames, SortStats stats) {
        if (low < high) {
            int pivot = partition(arr, low, high, frames, stats);
            recursiveQuickSort(arr, low, pivot - 1, frames, stats);
            recursiveQuickSort(arr, pivot + 1, high, frames, stats);
        }
    }

    private int partition(int[] arr, int low, int high, List<int[]> frames, SortStats stats) {
        int tempPivot = arr[high];
        int i = (low - 1);
        for (int j = low; j < high; j++) {
            if (stats != null) stats.incrementComparisons();
            if (arr[j] < tempPivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
                if (stats != null) stats.incrementSwaps();
                if(frames != null) frames.add(arr.clone());
            }
        }
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        if (stats != null) stats.incrementSwaps();
        if(frames != null) frames.add(arr.clone());
        return i + 1;
    }
}