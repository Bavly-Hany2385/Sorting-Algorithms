
package assigment1.ds.ds.sortingAlgorithms;

public class heapSort {
    public static void heapSort(int[] arr) {
        int arraySize = arr.length;

        for (int i = arraySize / 2 - 1; i >= 0; i--)
            heapify(arr, arraySize, i);

        for (int i = arraySize - 1; i > 0; i--) {
            int temp = arr[0];
            arr[0] = arr[i];
            arr[i] = temp;

            heapify(arr, i, 0);
        }
    }

    private static void heapify(int[] arr, int n, int i) {
        int parent = i; 
        int leftChild = 2 * i + 1; 
        int rightChild = 2 * i + 2; 

        if (leftChild < n && arr[leftChild] > arr[parent])
            parent = leftChild;

        if (rightChild < n && arr[rightChild] > arr[parent])
            parent = rightChild;

        if (parent != i) {
            int temp1 = arr[i];
            arr[i] = arr[parent];
            arr[parent] = temp1;

            heapify(arr, n, parent);
        }
    }
}
