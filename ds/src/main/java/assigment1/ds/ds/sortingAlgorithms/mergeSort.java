package assigment1.ds.ds.sortingAlgorithms;

import lombok.NoArgsConstructor;
import java.util.List;

@NoArgsConstructor
public class mergeSort implements visualization {
    @Override
    public void sort(int[] arr, List<int[]> frames, SortStats stats) {
        split(arr, 0, arr.length - 1, frames, stats);
    }

    private void split(int[] arr, int left, int right, List<int[]> frames, SortStats stats) {
        if (left < right) {
            int mid = left + (right - left) / 2;
            split(arr, left, mid, frames, stats);
            split(arr, mid + 1, right, frames, stats);
            merge(arr, left, mid, right, frames, stats);
        }
    }
    
    private void merge(int[] arr, int left, int mid, int right, List<int[]> frames, SortStats stats) {
        int n1 = mid - left + 1;
        int n2 = right - mid;
        int[] newLeft = new int[n1];
        int[] newRight = new int[n2];
        for (int i = 0; i < n1; ++i) newLeft[i] = arr[left + i];
        for (int j = 0; j < n2; ++j) newRight[j] = arr[mid + 1 + j];

        int i = 0, j = 0, k = left;
        while (i < n1 && j < n2) {
            if (newLeft[i] <= newRight[j]) {
                arr[k] = newLeft[i++];
            } else {
                arr[k] = newRight[j++];
            }
            if (stats != null) stats.incrementSwaps();
            if (stats != null) stats.incrementComparisons();
            if (frames != null) frames.add(arr.clone());
            k++;
        }
        while (i < n1) {
            arr[k++] = newLeft[i++];
            if (stats != null) stats.incrementSwaps();
            if (frames != null) frames.add(arr.clone());
        }
        while (j < n2) {
            arr[k++] = newRight[j++];
            if (stats != null) stats.incrementSwaps();
            if (frames != null) frames.add(arr.clone());
        }
    }
}