package assigment1.ds.ds.sortingAlgorithms;

import java.util.List;
import lombok.NoArgsConstructor;

@NoArgsConstructor
public class bubbleSort implements visualization {
    @Override
    public void sort(int[] arr, List<int[]> frames, SortStats stats) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (stats != null) stats.incrementComparisons();
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    if (stats != null) stats.incrementSwaps();
                    if(frames != null) frames.add(arr.clone());
                }
            }
        }
    }
}
