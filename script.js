// Utility Functions for LocalStorage
function getCarList() {
    const storedCars = localStorage.getItem("carList");
    return storedCars ? JSON.parse(storedCars) : [];
}

function saveCarList(carList) {
    localStorage.setItem("carList", JSON.stringify(carList));
}

// Function to Validate Admin Login
function validateLogin(username, password) {
    const correctUsername = "admin";
    const correctPassword = "password123";
    return username === correctUsername && password === correctPassword;
}

// Handle Admin Login
document.getElementById("login-form")?.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (validateLogin(username, password)) {
        localStorage.setItem("isAdminLoggedIn", "true");
        alert("Login successful!");
        window.location.href = "admin.html";
    } else {
        document.getElementById("error-message").style.display = "block";
    }
});

// Check Admin Login for Protected Pages
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("car-list-admin")) {
        const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn");
        if (isAdminLoggedIn !== "true") {
            alert("You must log in as an admin to access this page.");
            window.location.href = "login.html";
        }
    }
});

// Handle Logout
document.getElementById("logout")?.addEventListener("click", () => {
    localStorage.removeItem("isAdminLoggedIn");
    alert("Logged out successfully!");
    window.location.href = "index.html";
});

// Add or Edit Car
document.getElementById("car-form")?.addEventListener("submit", (event) => {
    event.preventDefault();

    const carId = document.getElementById("car-id").value;
    const carData = new FormData(event.target);

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
    images: carData.get("car-images").split(",").map((img) => img.trim()), // Split and trim
    videos: carData.get("car-videos").split(",").map((vid) => vid.trim()), // Split and trim
    licenseExpiration: carData.get("license-expiration"),
    insuranceExpiration: carData.get("insurance-expiration"),
    lastServiced: carData.get("last-serviced"),
    partsNeeded: carData.get("parts-needed"),
    problems: carData.get("problems"),
};

    let carList = getCarList();

    if (carId) {
        const carIndex = carList.findIndex((car) => car.id === parseInt(carId));
        carList[carIndex] = newCar;
        alert("Car updated successfully!");
    } else {
        carList.push(newCar);
        alert("Car added successfully!");
    }

    saveCarList(carList);
    window.location.href = "admin.html";
});

// Load Public Car List
function loadPublicCars() {
    const carListContainer = document.getElementById("car-list-public");
    const carList = getCarList();

    if (!carListContainer) {
        console.error("Public car list container not found!");
        return;
    }

    carListContainer.innerHTML = ""; // Clear previous content

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


// Load Admin Car List
function loadAdminCars() {
    const carListContainer = document.getElementById("car-list-admin");
    const carList = getCarList();

    carListContainer.innerHTML = "";

    carList.forEach((car) => {
        const carCard = document.createElement("div");
        carCard.classList.add("car-item");

        carCard.innerHTML = `
            <h3>${car.year} ${car.name}</h3>
            <p>Price: $${car.price}</p>
            <p>Odometer: ${car.odometer} miles</p>
            <a href="add_edit_car.html?id=${car.id}" class="button">Edit</a>
            <button class="button" onclick="deleteCar(${car.id})">Delete</button>
        `;

        carListContainer.appendChild(carCard);
    });
}

// Delete Car
function deleteCar(carId) {
    if (confirm("Are you sure you want to delete this car?")) {
        let carList = getCarList();
        carList = carList.filter((car) => car.id !== carId);

        saveCarList(carList);
        alert("Car deleted successfully!");
        window.location.reload();
    }
}

// Load Car Details
function loadCarDetails(carId) {
    const car = getCarList().find((c) => c.id === parseInt(carId));

    if (car) {
        const carDetailsContainer = document.getElementById("car-details");

        carDetailsContainer.innerHTML = `
            <h2>${car.year} ${car.name}</h2>
            <p><strong>Color:</strong> ${car.color}</p>
            <p><strong>Interior Color:</strong> ${car.interiorColor}</p>
            <p><strong>Interior Type:</strong> ${car.interiorType}</p>
            <p><strong>Odometer:</strong> ${car.odometer} miles</p>
            <p><strong>Asking Price:</strong> $${car.price}</p>
            <p><strong>VIN:</strong> ${car.vin}</p>
            <h3>Images:</h3>
            <div class="car-images">
                ${car.images
                    .map(
                        (img) =>
                            `<img src="${img}" alt="${car.name}" class="car-image" style="width: 100%; max-width: 300px; margin: 10px;">`
                    )
                    .join("")}
            </div>
        `;
    } else {
        alert("Car not found!");
        window.location.href = "index.html";
    }
}


// Initialize Pages
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("car-list-public")) {
        loadPublicCars();
    }

    if (document.getElementById("car-list-admin")) {
        loadAdminCars();
    }

    const carId = new URLSearchParams(window.location.search).get("id");
    if (carId && document.getElementById("car-details")) {
        loadCarDetails(carId);
    }
});

// Function to read uploaded images as Base64
function readImages(files) {
    return Promise.all(
        Array.from(files).map((file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result); // Base64 string
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });
        })
    );
}

// Handle Add/Edit Car Form Submission
document.getElementById("car-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const carData = new FormData(event.target);
    const carId = carData.get("id"); // Hidden field for editing
    const imageFiles = document.getElementById("car-images").files;

    // Read images as Base64
    let images = [];
    if (imageFiles.length > 0) {
        images = await readImages(imageFiles);
    }

    // Build car object
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
        images: images, // Base64 images
        licenseExpiration: carData.get("license-expiration"),
        insuranceExpiration: carData.get("insurance-expiration"),
        lastServiced: carData.get("last-serviced"),
        partsNeeded: carData.get("parts-needed"),
        problems: carData.get("problems"),
    };

    // Save to localStorage
    const carList = getCarList();
    if (carId) {
        // Editing existing car
        const index = carList.findIndex((car) => car.id === parseInt(carId));
        if (index !== -1) {
            carList[index] = newCar;
        }
    } else {
        // Adding new car
        carList.push(newCar);
    }

    saveCarList(carList);
    alert("Car saved successfully!");
    window.location.href = "admin.html";
});
