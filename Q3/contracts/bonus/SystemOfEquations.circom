pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib-matrix/circuits/matMul.circom";
include "../../node_modules/circomlib-matrix/circuits/matSub.circom";
include "../../node_modules/circomlib-matrix/circuits/matElemSum.circom";

template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution

    // [bonus] insert your code here
    // A.x-b=0;

    // A.x
    component mult = matMul(n,n,1);
    for(var i = 0; i < n; i++){
        for(var j = 0; j < n; j++){
          mult.a[i][j] <== A[i][j];
        }
        mult.b[i][0] <== x[i];
    }

    for(var i = 0; i < n; i++){
      log(mult.out[i][0]);
    }

    // A.x-b
    component sub = matSub(n,1);
    for(var i = 0; i < n; i++){
        sub.a[i][0] <== mult.out[i][0];
        sub.b[i][0] <== b[i];
    }

    for(var i = 0; i < n; i++){
      log(sub.out[i][0]);
    }

    // A.x-b=v0
    component sum = matElemSum(n,1);
    for(var i = 0; i < n; i++){
        sum.a[i][0] <== sub.out[i][0];
    }
    log(sum.out);

    //sum element v0 should be 0: 1 OK, 0 NOK 
    component isz = IsZero();
    isz.in <== sum.out;
    log(isz.out);

    out <== isz.out;
}

component main {public [A, b]} = SystemOfEquations(3);