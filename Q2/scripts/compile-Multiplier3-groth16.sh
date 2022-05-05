#!/bin/bash

# [assignment] create your own bash script to compile Multipler3.circom modeling after compile-Multiplier3.sh below

cd contracts/circuits
mkdir -p Multiplier3

echo "Compiling Multiplier3.circom..."

# Compile circuit
# output: Multiplier3.r1cs (that contains the constraint system of the circuit in binary format) / and ultiplier3_js (that contains the Wasm code (multiplier.wasm) and other files needed to generate the witness.)
circom Multiplier3.circom --r1cs --wasm --sym -o Multiplier3
#print info on the circuit
snarkjs r1cs info Multiplier3/Multiplier3.r1cs


# Start a new zkey and make a contribution
# Generate the verification key with groth16
snarkjs groth16 setup Multiplier3/Multiplier3.r1cs powersOfTau28_hez_final_10.ptau Multiplier3/circuit_0000.zkey
# Generate the contribution to the zkey
snarkjs zkey contribute Multiplier3/circuit_0000.zkey Multiplier3/circuit_final.zkey --name="1st Contributor Name" -v -e="random text"
# Export the verification key
snarkjs zkey export verificationkey Multiplier3/circuit_final.zkey Multiplier3/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier Multiplier3/circuit_final.zkey ../Multiplier3Verifier.sol

cd ../..
