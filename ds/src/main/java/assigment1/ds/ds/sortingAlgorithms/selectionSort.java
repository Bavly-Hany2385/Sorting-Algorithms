package assigment1.ds.ds.sortingAlgorithms;

import java.util.List;
import lombok.NoArgsConstructor;

@NoArgsConstructor
public class selectionSort implements visualization {
    @Override
    public void sort(int[] arr, List<int[]> frames, SortStats stats) {
        for (int i = 0; i < arr.length - 1; i++) {
            for (int j = i + 1; j < arr.length; j++) {
                if (arr[i] > arr[j]) {
                    int temp = arr[j];
                    arr[j] = arr[i];
                    arr[i] = temp;
                    if (stats != null) stats.incrementSwaps();
                    if (frames != null) frames.add(arr.clone());
                }
                if (stats != null) stats.incrementComparisons();
            }
        }
    }
}
