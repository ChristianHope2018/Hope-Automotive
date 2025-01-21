// IndexedDB Utility Functions
const dbName = "CarDatabase";
const storeName = "carStore";

// Open or Create IndexedDB
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: "id" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// Get All Cars
async function getCarList() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// Save or Update a Car
async function saveCarList(carList) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        carList.forEach((car) => store.put(car)); // Add or update each car
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(event.target.error);
    });
}

// Delete a Car
async function deleteCarById(carId) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.delete(carId);

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

// Admin Login and Logout
function validateLogin(username, password) {
    const correctUsername = "admin";
    const correctPassword = "password123";
    return username === correctUsername && password === correctPassword;
}

document.getElementById("login-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (validateLogin(username, password)) {
        sessionStorage.setItem("isAdminLoggedIn", "true");
        alert("Login successful!");
        window.location.href = "admin.html";
    } else {
        document.getElementById("error-message").style.display = "block";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("car-list-admin")) {
        const isAdminLoggedIn = sessionStorage.getItem("isAdminLoggedIn");
        if (!isAdminLoggedIn) {
            alert("You must log in as an admin to access this page.");
            window.location.href = "login.html";
        }
    }
});

document.getElementById("logout")?.addEventListener("click", () => {
    sessionStorage.removeItem("isAdminLoggedIn");
    alert("Logged out successfully!");
    window.location.href = "index.html";
});

// Add or Edit Car
document.getElementById("car-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const carData = new FormData(event.target);
    const carId = carData.get("id");
    const imageFiles = document.getElementById("car-images").files;

    // Read images as Base64
    let images = [];
    if (imageFiles.length > 0) {
        images = await readImages(imageFiles);
    }

    const newCar = {
        id: carId ? parseInt(carId) : Date.now(),
        year: carData.get("year"),
        name: carData.get("name"),
        color: carData.get("color"),
        interiorColor: carData.get("interior-color"),
        interiorType: carData.get("interior-type"),
        odometer: carData.get("odometer"),
        price: carData.get("price"),
        vin: carData.get("vin"),
        images: images,
        licenseExpiration: carData.get("license-expiration"),
        insuranceExpiration: carData.get("insurance-expiration"),
        lastServiced: carData.get("last-serviced"),
        partsNeeded: carData.get("parts-needed"),
        problems: carData.get("problems"),
    };

    const carList = await getCarList();
    if (carId) {
        const index = carList.findIndex((car) => car.id === parseInt(carId));
        if (index !== -1) carList[index] = newCar;
    } else {
        carList.push(newCar);
    }

    await saveCarList(carList);
    alert("Car saved successfully!");
    window.location.href = "admin.html";
});

// Delete Car
async function deleteCar(carId) {
    if (confirm("Are you sure you want to delete this car?")) {
        await deleteCarById(carId);
        alert("Car deleted successfully!");
        window.location.reload();
    }
}

// Load Public Cars
async function loadPublicCars() {
    const carListContainer = document.getElementById("car-list-public");
    const carList = await getCarList();

    if (!carListContainer) return console.error("Public car list container not found!");

    carListContainer.innerHTML = "";
    if (carList.length === 0) {
        carListContainer.innerHTML = "<p>No cars are available at the moment.</p>";
        return;
    }

    carList.forEach((car) => {
        const carCard = document.createElement("div");
        carCard.classList.add("car-item");

        const firstImage = car.images[0] || "https://via.placeholder.com/300";

        carCard.innerHTML = `
            <img src="${firstImage}" alt="${car.name}" class="car-thumbnail" style="width: 100%; max-width: 300px;">
            <h3>${car.year} ${car.name}</h3>
            <p><strong>Color:</strong> ${car.color}</p>
            <p><strong>Odometer:</strong> ${car.odometer} miles</p>
            <p><strong>Price:</strong> $${car.price}</p>
            <a href="car-details.html?id=${car.id}" class="button">View Details</a>
        `;

        carListContainer.appendChild(carCard);
    });
}

// Read Images as Base64
function readImages(files) {
    return Promise.all(
        Array.from(files).map((file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });
        })
    );
}

// Initialize Pages
document.addEventListener("DOMContentLoaded", async () => {
    const carId = new URLSearchParams(window.location.search).get("id");

    if (document.getElementById("car-list-public")) loadPublicCars();
    if (document.getElementById("car-list-admin")) loadPublicCars();
});
