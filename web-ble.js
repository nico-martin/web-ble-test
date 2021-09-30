const $connectButton = document.querySelector("#connect-button");
const $controls = document.querySelector("#controls");
const $error = document.querySelector("#error");
const $console = document.querySelector("#console");
const characteristicUUIDs = [0xff0b, 0xff0c, 0xff0d, 0xff0e];
let characteristics = [];

const encoder = new TextEncoder();

const consoleLog = (string) => {
  const text = $console.innerText;
  console.log(string);
  $console.innerText = `${string}\n${text}`;
};

const connect = async () => {
  $connectButton.setAttribute("disabled", "true");
  try {
    const device = await navigator.bluetooth.requestDevice({
      //acceptAllDevices: true,
      filters: [{ name: "Web BLE Test" }],
      optionalServices: [0xff0a],
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(0xff0a);

    characteristics = await Promise.all(
      characteristicUUIDs.map((uuid) => service.getCharacteristic(uuid))
    );
    consoleLog(`connected service ${0xff0a}`);
  } catch (error) {
    $error.innerHTML(error.toString());
  }

  $connectButton.style.display = "none";
  $controls.style.display = "block";
};

const startNotificationAll = () =>
  characteristics.map((char, i) => startNotification(i));

const startNotification = async (i) => {
  const time = new Date().getTime();
  consoleLog(`notification start ${characteristicUUIDs[i]}`);
  characteristics[i].addEventListener("characteristicvaluechanged", (e) =>
    consoleLog(
      `notification change ${characteristicUUIDs[i]}`,
      e.target.value.getInt8(0)
    )
  );
  await characteristics[i].startNotifications();
  consoleLog(
    `notification started ${characteristicUUIDs[i]} - ${
      new Date().getTime() - time
    }ms`
  );
};

const writeValueAll = () => characteristics.map((char, i) => writeValue(i));

const writeValue = async (i) => {
  const time = new Date().getTime();
  consoleLog(`write ${characteristicUUIDs[i]}`);

  await characteristics[i].writeValue(new Uint8Array([i * 2]));
  consoleLog(
    `write done ${characteristicUUIDs[i]} - ${new Date().getTime() - time}ms`
  );
};

const writeValueLongAll = () =>
  characteristics.map((char, i) => writeValueLong(i));

const writeValueLong = async (i) => {
  const time = new Date().getTime();
  consoleLog(`write long ${characteristicUUIDs[i]}`);

  await characteristics[i].writeValue(
    encoder.encode(
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua."
    )
  );
  consoleLog(
    `write long done ${characteristicUUIDs[i]} - ${
      new Date().getTime() - time
    }ms`
  );
};
