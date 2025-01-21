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

document.addEventListener("DOMContentLoaded", () => {
    // Login Form Submission
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
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
    }

    // Admin Page Authentication Check
    if (document.getElementById("car-list-admin")) {
        const isAdminLoggedIn = sessionStorage.getItem("isAdminLoggedIn");
        if (!isAdminLoggedIn) {
            alert("You must log in as an admin to access this page.");
            window.location.href = "login.html";
        }
    }

    // Logout Button
    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            sessionStorage.removeItem("isAdminLoggedIn");
            alert("Logged out successfully!");
            window.location.href = "index.html";
        });
    }

    // Car Form Submission
    const carForm = document.getElementById("car-form");
    if (carForm) {
        carForm.addEventListener("submit", async (event) => {
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
    }

    // Load Public Cars
    if (document.getElementById("car-list-public")) {
        loadPublicCars();
    }

    // Load Admin Cars
    if (document.getElementById("car-list-admin")) {
        loadAdminCars();
    }

    // Load Car Details
    const carDetailsContainer = document.getElementById("car-details");
    if (carDetailsContainer) {
        const carId = new URLSearchParams(window.location.search).get("id");
        loadCarDetails(carId);
    }
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

// Load Admin Cars
async function loadAdminCars() {
    const carListContainer = document.getElementById("car-list-admin");
    const carList = await getCarList();

    carListContainer.innerHTML = "";
    if (carList.length === 0) {
        carListContainer.innerHTML = "<p>No cars in the database.</p>";
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
            <button onclick="deleteCar(${car.id})">Delete</button>
        `;

        carListContainer.appendChild(carCard);
    });
}

// Load Car Details
async function loadCarDetails(carId) {
    const carDetailsContainer = document.getElementById("car-details");
    const carList = await getCarList();
    const car = carList.find((car) => car.id === parseInt(carId));

    if (!car) {
        carDetailsContainer.innerHTML = "<p>Car not found.</p>";
        return;
    }

    const firstImage = car.images[0] || "https://via.placeholder.com/300";

    carDetailsContainer.innerHTML = `
        <img src="${firstImage}" alt="${car.name}" class="car-thumbnail" style="width: 100%; max-width: 300px;">
        <h3>${car.year} ${car.name}</h3>
        <p><strong>Color:</strong> ${car.color}</p>
        <p><strong>Odometer:</strong> ${car.odometer} miles</p>
        <p><strong>Price:</strong> $${car.price}</p>
        <p><strong>Interior Color:</strong> ${car.interiorColor}</p>
        <p><strong>Interior Type:</strong> ${car.interiorType}</p>
        <p><strong>VIN:</strong> ${car.vin}</p>
        <p><strong>License Expiration:</strong> ${car.licenseExpiration}</p>
        <p><strong>Insurance Expiration:</strong> ${car.insuranceExpiration}</p>
        <p><strong>Last Serviced:</strong> ${car.lastServiced}</p>
        <p><strong>Parts Needed:</strong> ${car.partsNeeded}</p>
        <p><strong>Problems:</strong> ${car.problems}</p>
    `;
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

document.addEventListener("DOMContentLoaded", async () => {
    const carId = new URLSearchParams(window.location.search).get("id");
    const viewImagesButton = document.getElementById("view-images");

    if (viewImagesButton && carId) {
        viewImagesButton.addEventListener("click", () => {
            window.location.href = `car-images.html?id=${carId}`;
        });
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    const carId = new URLSearchParams(window.location.search).get("id");
    const carImagesContainer = document.getElementById("car-images-container");

    if (carId && carImagesContainer) {
        const carList = await getCarList();
        const car = carList.find((car) => car.id === parseInt(carId));

        if (car && car.images && car.images.length > 0) {
            car.images.forEach((image) => {
                const img = document.createElement("img");
                img.src = image;
                img.alt = `${car.name} image`;
                img.style.maxWidth = "300px";
                img.style.margin = "10px";
                carImagesContainer.appendChild(img);
            });
        } else {
            carImagesContainer.innerHTML = `<p>No images available for this car.</p>`;
        }
    }
});
