package assigment1.ds.ds.sortingAlgorithms;

import java.util.List;
import lombok.NoArgsConstructor;

@NoArgsConstructor
public class insertionSort implements visualization{
    @Override
    public void sort(int[] arr, List<int[]> frames, SortStats stats) {
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                if (stats != null) stats.incrementComparisons();
                arr[j + 1] = arr[j];
                if (stats != null) stats.incrementSwaps();
                j = j - 1;
                if(frames != null) frames.add(arr.clone());
            }
            arr[j + 1] = key;
            if (stats != null) stats.incrementComparisons();    //The exit comparison
            if(frames != null) frames.add(arr.clone());
        }
    }
}
