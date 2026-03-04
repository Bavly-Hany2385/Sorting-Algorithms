package assigment1.ds.ds.sortingAlgorithms;

public class bubbleSort {
    public static void bubbleSort(int[] arr) {
        int arraySize = arr.length;
        for (int i = 0; i < arraySize - 1; i++) {
            for (int j = 0; j < arraySize - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }
}
