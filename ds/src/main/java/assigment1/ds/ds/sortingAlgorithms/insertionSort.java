package assigment1.ds.ds.sortingAlgorithms;

public class insertionSort {
    public static void insertionSort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            int j = i - 1;
            while (j >= 0 && arr[j] > arr[i]) {
                arr[j + 1] = arr[j];
                j = j - 1;
            }
            arr[j + 1] = arr[i];
        }
    }
}
