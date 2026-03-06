package assigment1.ds.ds.sortingAlgorithms;

import java.util.List;
import lombok.NoArgsConstructor;

@NoArgsConstructor
public class selectionSort implements visualization {
    @Override
    public void sort(int[] arr, List<int[]> frames, SortStats stats) {
        for (int i = 0; i < arr.length - 1; i++) {
            int minIndex = i;
            for (int j = i + 1; j < arr.length; j++) {
                if (arr[j] < arr[minIndex]) {
                    minIndex = j;
                }
                if (stats != null) stats.incrementComparisons();
            }
            int temp = arr[minIndex];
            arr[minIndex] = arr[i];
            arr[i] = temp;
            if (stats != null) stats.incrementSwaps();
            if (frames != null) frames.add(arr.clone());
        }
    }
}
