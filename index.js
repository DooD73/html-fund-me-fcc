import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

document.getElementById("form").addEventListener("submit", handleFormSubmit);
const connectBtn = document.getElementById("connect-btn");
const fundBtn = document.getElementById("fund-btn");
const withdrawBtn = document.getElementById("withdraw-btn");
const balanceBtn = document.getElementById("balance-btn");
const balanceOutput = document.getElementById("balance-output");
const ethAmountInput = document.getElementById("ethAmount-input");
connectBtn.onclick = connect;
fundBtn.onclick = fund;
withdrawBtn.onclick = withdraw;
balanceBtn.onclick = getBalance;

if (localStorage.getItem("connected") === true) {
  connectBtn.innerHTML = "Connected";
}

async function connect() {
  if (typeof window.ethereum !== "undefinded") {
    // connect metamask
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      connectBtn.innerHTML = "Connected";
      localStorage.setItem("connected", true);
    } catch (e) {
      alert("You rejected the connection request");
      console.log(e);
      localStorage.setItem("connected", false);
    }
  } else {
    alert("Please install metamask");
    localStorage.setItem("connected", false);
  }
}

async function fund() {
  const ethAmount = ethAmountInput.value;
  console.log("Funding with " + ethAmount + "...");
  if (typeof window.ethereum !== "undefined") {
    // provider / connection to the blockchain
    // signer / wallet / someone with some gas
    // contract that we are interacting with
    // ^ ABI & Address
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    // tx
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      // Listen for the tx to be mined
      await listenForTxMined(transactionResponse, provider);
      console.log("Funded!");
    } catch (e) {
      console.log(e);
    }
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    balanceOutput.innerHTML =
      "Balance: " + ethers.utils.formatEther(balance) + " ETH";
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.withdraw();
      await listenForTxMined(transactionResponse, provider);
      console.log("Withdrawn!");
    } catch (e) {
      console.log(e);
    }
  }
}

function listenForTxMined(transactionResponse, provider) {
  console.log("Mining " + transactionResponse.hash + "...");
  // create a listener for the blockchain
  // when it is mined, resolve the promise
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        "Completed with " + transactionReceipt.confirmations + " confirmations!"
      );
      resolve();
    });
  });
}

function handleFormSubmit(event) {
  event.preventDefault();
}
