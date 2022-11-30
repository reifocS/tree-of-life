// To store a point in 2-D space
class Point {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}
 
// Test points. These points are the left,
// up, right and down relative neighbours
// (arranged circularly) to the
// current_point at a distance of
// test_distance from current_point
let test_point = [new Point(-1, 0),
                  new Point(0, 1),
                  new Point( 1, 0),
                  new Point(0, -1)];
 
 
// Lowest Limit till which we are going
// to run the main while loop
// Lower the Limit higher the accuracy
let lower_limit = 0.01;
 
// Function to return the sum of Euclidean
// Distances
function distSum(p, arr, n)
{
    let sum = 0;
    for (let i = 0; i < n; i++) {
        let distx = Math.abs(arr[i].x - p.x);
        let disty = Math.abs(arr[i].y - p.y);
        sum += Math.sqrt((distx * distx) + (disty * disty));
    }
 
    // Return the sum of Euclidean Distances
    return sum;
}
 
// Function to calculate the required
// geometric median
function geometricMedian(arr, n)
{
 
    // Current x coordinate and y coordinate
    let current_point = new Point(0, 0);
     
    for (let i = 0; i < n; i++) {
        current_point.x = current_point.x + arr[i].x;
        current_point.y = current_point.y + arr[i].y;
    }
 
    // Here current_point becomes the
    // Geographic MidPoint
    // Or Center of Gravity of equal
    // discrete mass distributions
    current_point.x /= n;
    current_point.y /= n;
 
    // minimum_distance becomes sum of
    // all distances from MidPoint to
    // all given points
    let minimum_distance = distSum(current_point, arr, n);
 
    let k = 0;
    while (k < n) {
        for (let i = 0; i < n, i != k; i++) {
            let newpoint = new Point(0, 0);
            newpoint.x = arr[i].x;
            newpoint.y = arr[i].y;
            let newd = distSum(newpoint, arr, n);
            if (newd < minimum_distance) {
                minimum_distance = newd;
                current_point.x = newpoint.x;
                current_point.y = newpoint.y;
            }
        }
        k++;
    }
 
    // Assume test_distance to be 1000
    let test_distance = 1000;
    let flag = 0;
 
    // Test loop for approximation starts here
    while (test_distance > lower_limit) {
 
        flag = 0;
 
        // Loop for iterating over all 4 neighbours
        for (let i = 0; i < 4; i++) {
 
            // Finding Neighbours done
            let newpoint = new Point();
            newpoint.x = current_point.x + test_distance * test_point[i].x;
            newpoint.y = current_point.y + test_distance * test_point[i].y;
 
            // New sum of Euclidean distances
            // from the neighbor to the given
            // data points
            let newd = distSum(newpoint, arr, n);
 
            if (newd < minimum_distance) {
 
                // Approximating and changing
                // current_point
                minimum_distance = newd;
                current_point.x = newpoint.x;
                current_point.y = newpoint.y;
                flag = 1;
                break;
            }
        }
 
        // This means none of the 4 neighbours
        // has the new minimum distance, hence
        // we divide by 2 and reiterate while
        // loop for better approximation
        if (flag == 0)
            test_distance /= 2;
    }
 
    return current_point;
}


export default geometricMedian;