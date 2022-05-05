#!/bin/bash

# [assignment] create your own bash script to compile Multipler3.circom using PLONK below

cd contracts/circuits
mkdir -p Multiplier3_plonk

echo "Compiling Multiplier3.circom... PLONK"

# Compile circuit
# output: Multiplier3.r1cs (that contains the constraint system of the circuit in binary format) / and ultiplier3_js (that contains the Wasm code (multiplier.wasm) and other files needed to generate the witness.)
circom Multiplier3.circom --r1cs --wasm --sym -o Multiplier3_plonk
#print info on the circuit
snarkjs r1cs info Multiplier3_plonk/Multiplier3.r1cs


# Start a new zkey and make a contribution
# Generate the verification key with PLONK
echo "Generating verification key with PLONK"
snarkjs plonk setup Multiplier3_plonk/Multiplier3.r1cs powersOfTau28_hez_final_10.ptau Multiplier3_plonk/circuit_final.zkey

# Generate the contribution to the zkey "NOT NEEDED IN PLONK" -> groth16 need a contribution to the zkey
#echo "Generating contribution to the zkey"
#snarkjs zkey contribute Multiplier3_plonk/circuit_0000.zkey Multiplier3_plonk/circuit_final.zkey --name="1st Contributor Name" -v -e="random text"

# Export the verification key
echo "Exporting verification key"
snarkjs zkey export verificationkey Multiplier3_plonk/circuit_final.zkey Multiplier3_plonk/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier Multiplier3_plonk/circuit_final.zkey ../Multiplier3Verifier_plonk.sol

cd ../..
