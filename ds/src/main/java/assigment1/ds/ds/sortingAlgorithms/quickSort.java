package assigment1.ds.ds.sortingAlgorithms;

public class quickSort {
    public static void quickSort(int[] arr, int start, int last) {
        if (start < last) {
            int pivot = partition(arr, start, last);
            quickSort(arr, start, pivot - 1);
            quickSort(arr, pivot + 1, last);
        }
    }

    private static int partition(int[] arr, int low, int last) {
        int i = low;
        for (int j = low; j < last; j++) {
            if (arr[j] < arr[last]) {
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
                i++;
            }
        }
        int temp = arr[i];
        arr[i] = arr[last];
        arr[last] = temp;
        return i;
    }
}
