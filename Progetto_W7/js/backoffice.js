const endPoint = "https://striveschool-api.herokuapp.com/api/put-your-endpoint-here/";
const token =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTcyMjRiNDBkOGEyMDAwMThhNDhiNmIiLCJpYXQiOjE3MDIyMDQ4NjYsImV4cCI6MTcwMzQxNDQ2Nn0.ZaHi4cl78UM2oeVCb3fCX38RcjVPCeC4AnIqL-EkD2A";

const resourceId = new URLSearchParams(window.location.search).get("resourceId");

const H1 = document.querySelector("h1");
const previewImage = document.getElementById("preview-image");
const nameField = document.getElementById("name");
const descriptionField = document.getElementById("description");
const brandField = document.getElementById("brand");
const imageUrlField = document.getElementById("imageUrl");
const priceField = document.getElementById("price");
const submitButton = document.getElementById("submitButton");
const buttonForModalDeleteRequest = document.getElementById("buttonForModalDeleteRequest");
const deleteButton = document.getElementById("deleteButton");
const resetFieldsButton = document.getElementById("resetFields");
const alertBox = document.getElementById("alert-box");
const deleteRequestModal = document.getElementById("deleteRequestModal");

let method, URL;

if (resourceId) {
  method = "PUT";
  URL = endPoint + resourceId;
  fillFieldByResourceId();
  submitButton.classList.add("btn-warning");
  submitButton.innerHTML = "Salva modifica";
  H1.innerHTML = "Modifica un articolo";
} else {
  method = "POST";
  URL = endPoint;
  submitButton.classList.add("btn-primary");
  submitButton.innerHTML = "Crea";
  H1.innerHTML = "Inserisci un nuovo articolo";
  buttonForModalDeleteRequest.classList.add("d-none");
  resetFieldsButton.classList.add("d-none");
}

submitButton.addEventListener("click", handleRequest);
deleteButton.addEventListener("click", handleDelete);
resetFieldsButton.addEventListener("click", emptyFields);

function handleRequest(event) {
  event.preventDefault();
  const newItem = {
    name: nameField.value,
    description: descriptionField.value,
    brand: brandField.value,
    imageUrl: imageUrlField.value,
    price: priceField.value,
  };

  fetch(URL, {
    method,
    body: JSON.stringify(newItem),
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  })
    .then(handleResponse)
    .then((item) => showAlert(item._id, method, item.imageUrl))
    .catch(handleError);
}

function handleDelete(event) {
  event.preventDefault();

  fetch(URL, {
    method: "DELETE",
    headers: { Authorization: token },
  })
    .then(handleResponse)
    .then((deletedObj) => {
      showAlert(deletedObj._id, "DELETE", deletedObj.imageUrl);
      setTimeout(() => {
        window.location.assign("./index.html");
      }, 3000);
    })
    .catch(handleError);
}

function handleResponse(response) {
  console.log(response);
  switch (true) {
    case response.status === 404:
      throw new Error(response.status, " risorsa non trovata");
      break;
    case response.status === 401:
      throw new Error("Non sei autorizzato. Errore: " + response.status);
      break;
    case response.status >= 400 && response.status < 500:
      throw new Error("Errore lato Client: " + response.status);
      break;
    case response.status >= 500 && response.status < 600:
      throw new Error("Errore lato Server: " + response.status);
      break;
    default:
      break;
  }
  if (!response.ok) throw new Error("Errore nel reperimento dei dati");

  return response.json();
}

function showAlert(id, methodType, urlImgObjCreatedOrEdited) {
  let colorCode, action;

  switch (methodType) {
    case "POST":
      colorCode = "success";
      action = "creato";
      break;
    case "PUT":
      colorCode = "warning";
      action = "modificato";
      break;
    case "DELETE":
      colorCode = "danger";
      action = "eliminato";
      break;
    default:
      colorCode = "secondary";
      break;
  }

  alertBox.innerHTML = `<div class="alert alert-${colorCode} p-5" role="alert">
	L'item con ID ${id} è stato <span class="fs-3">${action}</span>
	</div>`;

  previewImage.innerHTML = `
	<img
		src="${urlImgObjCreatedOrEdited}"
		class="img-thumbnail mx-auto d-block my-4"
		alt="..."
		style="max-height: 200px"
	/>`;

  setTimeout(() => {
    window.location.href = "./backoffice.html";
  }, 3000);
}

function fillFieldByResourceId() {
  fetch(URL, {
    headers: {
      Authorization: token,
    },
  })
    .then(handleResponse)
    .then((returnedObj) => {
      const { name, description, brand, imageUrl, price, _id } = returnedObj;

      previewImage.innerHTML = `
			<img
				src="${imageUrl}"
				class="img-thumbnail mx-auto d-block my-4"
				alt="..."
				style="max-height: 200px"
			/>`;
      nameField.value = name;
      descriptionField.value = description;
      brandField.value = brand;
      imageUrlField.value = imageUrl;
      priceField.value = price;
    })
    .catch(handleError);
}

function emptyFields() {
  nameField.value = "";
  descriptionField.value = "";
  brandField.value = "";
  imageUrlField.value = "";
  priceField.value = "";
}

function handleError(error) {
  console.log(error);
}
