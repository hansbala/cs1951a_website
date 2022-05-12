const ctx = document.getElementById("graph-section").getContext("2d");
let currentGpu = "3060ti";
let globalPrices = [];
let ethPrices = [];
let includeEth = true;
let months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
let labels = months;
let data = {
  labels: labels,
  datasets: [
    {
      label: currentGpu,
      data: globalPrices,
      fill: false,
      borderColor: "rgb(75, 192, 192)",
      tension: 0.1,
    },
    {
      label: "ETH",
      data: ethPrices,
      fill: false,
      borderColor: "rgb(255, 99, 132)",
      tension: 0.1,
    },
  ],
};
let config = {
  type: "line",
  data: data,
};
let myChart = new Chart(ctx, config);

async function fetchFile(path) {
  return fetch(path).then((response) => response.json());
}

async function getNewData(gpu) {
  let json = await fetchFile(`./assets/${gpu}.json`);
  const tmp = json["data"]["product"]["salesChart"]["series"];
  let prices = [];
  for (let i = 0; i < tmp.length; i++) {
    prices.push(tmp[i]["yValue"]);
  }
  return prices;
}

async function getEthPrices() {
  let json = await fetchFile(`./assets/eth.json`);
  const tmp = json["data"]["points"];
  let prices = [];
  for (let [key, value] of Object.entries(tmp)) {
    const price = value["v"][0];
    prices.push(price);
  }
  prices.splice(0, 350);
  let toOmit = prices.length - 100;
  let gapIndex = Math.floor(toOmit / 100);
  let toKeepIdx = [];
  for (let i = 0; i < prices.length; i += gapIndex) {
    toKeepIdx.push(i);
  }
  let newPrices = [];
  for (let i = 0; i < toKeepIdx.length; i++) {
    newPrices.push(prices[toKeepIdx[i]]);
  }
  if (newPrices.length >= 100) {
    newPrices.splice(100, newPrices.length - 100);
  }
  return prices;
}

async function updateGraphs() {
  const newData = await getNewData(currentGpu);
  const ethPrices = await getEthPrices();
  globalPrices = newData;
  // create new labels
  let newLabels = [];
  for (let i = 0; i < newData.length; i++) {
    newLabels.push("");
  }
  cnt = 0;
  for (let i = 0; ; i += Math.floor(newData.length / 12)) {
    newLabels[i] = months[cnt];
    cnt += 1;
    if (cnt >= 12) {
      break;
    }
  }
  labels = newLabels;
  myChart.destroy();
  const ethSection = {
    label: "ETH",
    data: ethPrices,
    fill: false,
    borderColor: "rgb(255, 99, 132)",
  };
  data = {
    labels: labels,
    datasets: [
      {
        label: currentGpu,
        data: globalPrices,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };
  if (includeEth) {
    data["datasets"].push(ethSection);
  }
  config = {
    type: "line",
    data: data,
  };
  myChart = new Chart(ctx, config);
}

$(".dropdown-item").click(function () {
  currentGpu = $(this).text();
  currentGpu = currentGpu.toLowerCase();
  $("#dropdownMenuButton1").text(currentGpu);
  updateGraphs();
});

$("#flexCheckChecked").click(function () {
  includeEth = !includeEth;
  updateGraphs();
});

updateGraphs();
