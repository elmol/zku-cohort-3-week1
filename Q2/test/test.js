const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing

        // generate the proof and the public signals (in this case only the output) from two inputs "1" and "2",  the witness file and the zkey
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        //logs the public signal (output)
        //1x2 = 2
        console.log('1x2 =',publicSignals[0]);

        // generate the calldata based on the proof and the public signals
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        // console.log("calldata:",calldata);
    
        // parse calldata to get the arguments
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        // console.log("args",argv);
        
        // get pairing for build the proof
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        // console.log("proof", a,b,c);

        // get signal output (2)
        const Input = argv.slice(8);
   
        // verify the proof 
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
       // generate the proof and the public signals (in this case only the output) from inputs "1" , "2" and "3",  the witness file and the zkey
       const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");

       //logs the public signal (output)
       //1x2x3 = 6
       console.log('1x2x3 =',publicSignals[0]);

       // generate the calldata based on the proof and the public signals
       const editedPublicSignals = unstringifyBigInts(publicSignals);
       const editedProof = unstringifyBigInts(proof);
       const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
    //    console.log("calldata:",calldata);
   
       // parse calldata to get the arguments
       const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    //    console.log("args",argv);
       
       // get pairing for build the proof
       const a = [argv[0], argv[1]];
       const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
       const c = [argv[6], argv[7]];
    //    console.log("proof", a,b,c);

       // get signal output (6)
       const Input = argv.slice(8);
    //    console.log("Proof:", Input);
  
       // verify the proof 
       expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {

    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("PlonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here

       // generate the proof and the public signals (in this case only the output) from inputs "1" , "2" and "3",  the witness file and the zkey
       const { proof, publicSignals } = await plonk.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3_plonk/circuit_final.zkey");
       
       //logs the public signal (output)
       //1x2x3 = 6
       console.log('1x2x3 =',publicSignals[0]);

        // generate the calldata based on the proof and the public signals
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);
        // console.log("calldata:",calldata);

        // parse calldata to get the arguments
        const argv = calldata.replace(/["[\]\s]/g, "").split(',');
        // console.log("args",argv);

        const proofCallData = argv[0];
        const pubSignals = [argv[1]];

       // verify the proof 
       expect(await verifier.verifyProof(proofCallData,publicSignals)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        const invalidProof = 0x0;
        expect(await verifier.verifyProof(invalidProof,[6])).to.be.false;
    });
});